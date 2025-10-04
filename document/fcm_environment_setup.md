# FCM 環境変数登録ガイド

Firebase Cloud Messaging (FCM) を Supabase Edge Functions から利用するためには、サービスアカウント情報などの秘密情報を Supabase プロジェクトに登録しておく必要があります。本ドキュメントではローカル開発・本番環境双方での取り扱い手順を整理します。

## 1. 必要な情報
Firebase コンソールからダウンロードしたサービスアカウント JSON から、以下の値を抽出します。

| 環境変数名 | 内容 | 取得元 |
| --- | --- | --- |
| `FCM_PROJECT_ID` | Firebase プロジェクト ID | `"project_id"` |
| `FCM_CLIENT_EMAIL` | サービスアカウントのクライアントメール | `"client_email"` |
| `FCM_PRIVATE_KEY` | サービスアカウントのプライベートキー | `"private_key"` |

> **注意:** `FCM_PRIVATE_KEY` は改行を `\n` にエスケープした上でセットします。

## 2. ローカル開発環境
- ファイル: `supabase/.env`
- 目的: `supabase functions serve` などローカルの Edge Runtime で環境変数を参照する。
- サンプル:
  ```env
  EDGE_SUPABASE_URL=...
  EDGE_SUPABASE_SERVICE_ROLE_KEY=...
  FCM_PROJECT_ID=...
  FCM_CLIENT_EMAIL=...
  FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  ```
- `.gitignore` によりリポジトリへはコミットしない。

## 3. Supabase プロジェクト（本番/ステージング）
1. FCM 用の環境変数だけを含むファイルを用意する（例: `supabase/fcm_secrets.env`）。
   ```env
   FCM_PROJECT_ID=...
   FCM_CLIENT_EMAIL=...
   FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   - リポジトリには含めず、`.gitignore` に追加済みであることを確認。
2. Supabase CLI から秘密情報を登録する。
   ```bash
   supabase secrets set --env-file supabase/fcm_secrets.env
   ```
   実行後、`Set secret FCM_PROJECT_ID` などのメッセージが表示されれば成功です。
3. Edge Functions からは `Deno.env.get('FCM_PROJECT_ID')` などで参照できるようになります。

## 4. 利用予定箇所
- `register-device` Edge Function: 現状は FCM 送信を行っていませんが、デバイス登録時にトークンを保存します。
- `scan-and-fire` Edge Function（実装予定）: `followup_jobs` をスキャンし、登録された FCM トークン宛に通知を送信する際に上記環境変数を使用します。

## 5. 運用上の注意
- サービスアカウントの権限は最小限（Firebase Cloud Messaging API のみ）に絞る。
- 秘密情報を更新した場合は、再度 `supabase secrets set` を実行して上書きする。
- 本番・ステージングなど複数プロジェクトを運用する場合は、CLI の `--project-ref` で対象を切り替えて登録する。
- CI/CD で Edge Functions をデプロイする際は、Supabase プロジェクトに登録済みのシークレットが自動的に適用されるため、追加設定は不要。

## 6. 参考
- Supabase CLI ドキュメント: <https://supabase.com/docs/guides/cli/local-development>
- Firebase Admin サービスアカウント生成: <https://firebase.google.com/docs/admin/setup>
