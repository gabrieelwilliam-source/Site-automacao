-- Isolated demonstration storage. No business table reads or writes.
CREATE SCHEMA IF NOT EXISTS zion_webdemo_v1;
REVOKE ALL ON SCHEMA zion_webdemo_v1 FROM PUBLIC;
CREATE TABLE IF NOT EXISTS zion_webdemo_v1.sessions (
 session_key text PRIMARY KEY, state jsonb NOT NULL DEFAULT '{"intent":"Recepção","service":null,"expected":null,"appointment":null,"payment":null,"human":false,"lead":{},"selectedProperty":null,"visit":null}',
 history jsonb NOT NULL DEFAULT '[]', turns integer NOT NULL DEFAULT 0,
 updated_at timestamptz NOT NULL DEFAULT now(), last_call timestamptz,
 lease text, busy_until timestamptz
);
CREATE TABLE IF NOT EXISTS zion_webdemo_v1.quotas(day date PRIMARY KEY,calls integer NOT NULL DEFAULT 0);
ALTER TABLE zion_webdemo_v1.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE zion_webdemo_v1.quotas ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON zion_webdemo_v1.sessions,zion_webdemo_v1.quotas FROM PUBLIC;
CREATE OR REPLACE FUNCTION zion_webdemo_v1.enter_chat(p jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
DECLARE b jsonb:=p->'body'; k text; row zion_webdemo_v1.sessions; budget integer; needs_ai boolean; token text;
BEGIN
 IF p->>'origin' IS DISTINCT FROM 'https://gabrieelwilliam-source.github.io' THEN RETURN jsonb_build_object('ok',false,'status',403,'error','Origem não autorizada.'); END IF;
 IF b->>'segment' IS NULL OR b->>'segment' NOT IN ('salao','clinica','imobiliaria') OR coalesce(b->>'session','') !~ '^demo_[a-zA-Z0-9_-]{16,80}$' THEN RETURN jsonb_build_object('ok',false,'status',400,'error','Sessão inválida.'); END IF;
 IF jsonb_typeof(b->'message') IS DISTINCT FROM 'string' OR length(trim(coalesce(b->>'message','')))=0 OR length(b->>'message')>800 THEN RETURN jsonb_build_object('ok',false,'status',400,'error','Escreva uma mensagem com até 800 caracteres.'); END IF;
 DELETE FROM zion_webdemo_v1.sessions WHERE updated_at<now()-interval '30 minutes' AND coalesce(busy_until,now())<=now();
 DELETE FROM zion_webdemo_v1.quotas WHERE day<current_date-2;
 INSERT INTO zion_webdemo_v1.quotas(day,calls) VALUES(current_date,0) ON CONFLICT DO NOTHING;
 SELECT calls INTO budget FROM zion_webdemo_v1.quotas WHERE day=current_date FOR UPDATE;
 IF (SELECT count(*) FROM zion_webdemo_v1.sessions)>150 THEN RETURN jsonb_build_object('ok',false,'status',429,'error','Há muitas demonstrações em andamento. Tente mais tarde.'); END IF;
 k:=(b->>'session')||':'||(b->>'segment');
 INSERT INTO zion_webdemo_v1.sessions(session_key) VALUES(k) ON CONFLICT DO NOTHING;
 SELECT * INTO row FROM zion_webdemo_v1.sessions WHERE session_key=k FOR UPDATE;
 IF row.busy_until>now() OR row.last_call>now()-interval '1.2 seconds' THEN RETURN jsonb_build_object('ok',false,'status',429,'error','Aguarde a resposta anterior antes de enviar outra mensagem.'); END IF;
 needs_ai:=coalesce(b->>'action','')='' AND NOT coalesce((row.state->>'human')::boolean,false);
 IF needs_ai AND (budget>=240 OR row.turns>=24) THEN RETURN jsonb_build_object('ok',false,'status',429,'error','Limite desta demonstração atingido. Converse com a Zion pelo botão de proposta.'); END IF;
 IF needs_ai THEN UPDATE zion_webdemo_v1.quotas SET calls=calls+1 WHERE day=current_date; END IF;
 token:=md5(random()::text||clock_timestamp()::text||k);
 UPDATE zion_webdemo_v1.sessions SET turns=turns+CASE WHEN needs_ai THEN 1 ELSE 0 END,lease=token,busy_until=now()+interval '45 seconds',last_call=now(),updated_at=now() WHERE session_key=k RETURNING * INTO row;
 RETURN jsonb_build_object('ok',true,'key',k,'lease',token,'payload',b,'session',jsonb_build_object('state',row.state,'history',row.history,'count',row.turns));
END $$;
CREATE OR REPLACE FUNCTION zion_webdemo_v1.finish_chat(p_key text,p_lease text,p_state jsonb,p_history jsonb,p_response jsonb) RETURNS jsonb LANGUAGE plpgsql AS $$
BEGIN
 IF p_key IS NULL THEN RETURN p_response; END IF;
 UPDATE zion_webdemo_v1.sessions SET
 state=CASE WHEN jsonb_typeof(p_state)='object' THEN p_state ELSE state END,
 history=CASE WHEN jsonb_typeof(p_history)='array' THEN p_history ELSE history END,
 updated_at=now(),busy_until=NULL,lease=NULL
 WHERE session_key=p_key AND lease=p_lease;
 IF NOT FOUND THEN RETURN jsonb_build_object('status',409,'result',jsonb_build_object('ok',false,'error','A sessão mudou enquanto a resposta era preparada. Recomece a demonstração.')); END IF;
 RETURN p_response;
END $$;
REVOKE ALL ON FUNCTION zion_webdemo_v1.enter_chat(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION zion_webdemo_v1.finish_chat(text,text,jsonb,jsonb,jsonb) FROM PUBLIC;
