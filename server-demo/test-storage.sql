-- Test fixtures only. Rollback leaves no test rows or quota changes.
BEGIN;
DO $$
DECLARE a jsonb;b jsonb;r jsonb;k1 text:='demo_storage_test_000001:salao';k2 text:='demo_storage_test_000002:salao';
BEGIN
 a:=zion_webdemo_v1.enter_chat('{"origin":"https://example.com","body":{}}');
 IF (a->>'status')::int<>403 THEN RAISE EXCEPTION 'Origin guard failed'; END IF;
 a:=zion_webdemo_v1.enter_chat('{"origin":"https://gabrieelwilliam-source.github.io","body":{"session":"bad","segment":"salao","message":"Oi"}}');
 IF (a->>'status')::int<>400 THEN RAISE EXCEPTION 'Session guard failed'; END IF;
 a:=zion_webdemo_v1.enter_chat('{"origin":"https://gabrieelwilliam-source.github.io","body":{"session":"demo_storage_test_000001","segment":"salao","message":"Oi"}}');
 b:=zion_webdemo_v1.enter_chat('{"origin":"https://gabrieelwilliam-source.github.io","body":{"session":"demo_storage_test_000002","segment":"salao","message":"Oi"}}');
 IF NOT (a->>'ok')::boolean OR NOT (b->>'ok')::boolean THEN RAISE EXCEPTION 'Gate failed'; END IF;
 r:=zion_webdemo_v1.enter_chat('{"origin":"https://gabrieelwilliam-source.github.io","body":{"session":"demo_storage_test_000001","segment":"salao","message":"Outra"}}');
 IF (r->>'status')::int<>429 THEN RAISE EXCEPTION 'Concurrent same session allowed'; END IF;
 PERFORM zion_webdemo_v1.finish_chat(k1,a->>'lease','{"service":"Corte","human":false}','[{"role":"user","content":"Quero corte"}]','{"status":200}');
 PERFORM zion_webdemo_v1.finish_chat(k2,b->>'lease','{"service":"Tratamento","human":false}','[]','{"status":200}');
 IF (SELECT state->>'service' FROM zion_webdemo_v1.sessions WHERE session_key=k1)<>'Corte' OR (SELECT state->>'service' FROM zion_webdemo_v1.sessions WHERE session_key=k2)<>'Tratamento' THEN RAISE EXCEPTION 'Sessions lost or mixed'; END IF;
 r:=zion_webdemo_v1.finish_chat(k1,'stale','{"service":"Wrong"}','[]','{"status":200}');
 IF (r->>'status')::int<>409 THEN RAISE EXCEPTION 'Stale lease accepted'; END IF;
 UPDATE zion_webdemo_v1.sessions SET last_call=now()-interval '5 seconds',turns=24 WHERE session_key=k1;
 r:=zion_webdemo_v1.enter_chat('{"origin":"https://gabrieelwilliam-source.github.io","body":{"session":"demo_storage_test_000001","segment":"salao","message":"Outra"}}');
 IF (r->>'status')::int<>429 THEN RAISE EXCEPTION 'Turn limit ignored'; END IF;
 IF (SELECT bool_and(relrowsecurity) FROM pg_class WHERE oid IN ('zion_webdemo_v1.sessions'::regclass,'zion_webdemo_v1.quotas'::regclass)) IS NOT TRUE THEN RAISE EXCEPTION 'RLS disabled'; END IF;
END $$;
ROLLBACK;
SELECT '8 storage assertions passed; rolled back' AS result;
