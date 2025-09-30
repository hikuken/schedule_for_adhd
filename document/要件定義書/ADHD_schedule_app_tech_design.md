# ADHD向けスケジュールアプリ 技術設計書 (MVP v0.3対応)

## 1. アーキテクチャ概要

```
[Flutter App]
  ├─ ローカルDB (Drift/Isar) / 状態管理 (Riverpod)
  ├─ Push受信 (Firebase Messaging) / 表示 (flutter_local_notifications)
  └─ REST/Realtime Client → [Supabase Backend]
                             ├─ Postgres (RLS)
                             ├─ Edge Functions (Deno)
                             ├─ Job Queue (通知ジョブ)
                             └─ Cron実行（pg_cron or Scheduled Functions）
                                     ↓
                            [Push送信サービス: FCM] → (APNs/iOS, FCM/Android)
```

- クライアント：Flutterでクロスプラットフォーム対応。  
- バックエンド：Supabaseを採用（Firebase以外の要望対応）。  
- 通知：サーバ側スケジューリングに基づきFCMでPush通知を配信。  
- 監視：Supabase Logsを使用（Sentryは将来必要に応じて）。  

---

## 2. 技術選定

### フロントエンド（Flutter）
- フレームワーク: Flutter (Stable)
- 状態管理: Riverpod
- ルーティング: go_router
- ローカルDB: Drift (型安全SQL) または Isar (高速NoSQL)
- 通知:
  - firebase_messaging (受信)
  - flutter_local_notifications (表示)
- 日付/繰り返し: timezone, rrule
- 観測: Sentry Flutter (任意)
- i18n: flutter_localizations

### バックエンド（Supabase）
- DB: Postgres + Row Level Security
- Auth: Supabase Auth（MVPでは匿名デバイスIDでも可）
- API: Edge Functions (Deno) + PostgREST
- 通知ジョブ:
  - Jobテーブルで「次回通知時刻」「再通知カウント」管理
  - pg_cron または Scheduled Functionsでジョブ実行
- Push送信: Edge Functionから FCM HTTP v1 API 経由で配信
- 監視: Supabase Logs

### Push通知 (FCM)
- 無料で利用可能（iOSはAPNsをFCMがブリッジ）
- サーバ側でスケジュール制御 → ユーザ端末に確実にPush配信

---

## 3. 通知仕様

- 対象: 終了時刻を過ぎた未完了タスク
- 初回通知: 終了〜終了+1時間の範囲でランダム1回
- 再通知: 前回通知から1時間以内のランダム時刻で再スケジュールし、完了まで繰り返す
- 停止条件: タスクが完了または削除された場合
- 実装: サーバ側ジョブキューとFCMを利用

---

## 4. データモデル（MVP）

- users（将来拡張用。MVPではnullable）
- devices（device_id, fcm_token, platform, user_id?）
- tasks（id, device_id/user_id, title, start_at, end_at, repeat_rule, memo, status, completed_at）
- followup_jobs（task_id, next_fire_at, last_fired_at, retry_count, active_flag）
- notifications（履歴/デバッグ用: sent_at, result_code）

Row Level Security (RLS) により、ユーザー/デバイス単位でアクセスを制御。

---

## 5. API設計例

- `POST /register-device` : デバイス登録/更新 (fcm_token)
- `POST /tasks` / `PATCH /tasks/:id` / `DELETE /tasks/:id`
- `POST /tasks/:id/complete` : タスク完了 → followup_jobs停止
- 内部API: `POST /jobs/scan-and-fire` (Cron専用、通知送信)

---

## 6. 実装方針

1. **Supabase Microプラン**で開始（$10/月）。  
   - 開発〜クローズドテスト段階では十分。  
   - 一般公開時にProプランへ移行予定（$25/月）。  
2. **Apple Developer Program**に加入（$99/年）。  
   - iOS配布、TestFlight、Push通知(APNsキー)のため必須。  
3. **Google Play登録**（$25、一回限り）。  
4. MVP開発フロー:
   - Supabaseプロジェクト作成 → RLS設定 → スキーマ定義 (tasks, jobs)  
   - Edge Functions雛形実装（register-device, scan-and-fire）  
   - Flutterアプリ骨格構築（スケジュール画面 / 今日画面 / 編集モーダル）  
   - FCM統合 → 通知実機確認  
   - OpenAPI定義からDartクライアント自動生成  
   - クローズドテスト (TestFlight / Internal Test Track)  

---

## 7. コスト試算

- Supabase Micro: $10/月 (約¥1,500)
- App Store Developer Program: $99/年 (約¥14,850)
- Google Play Developer 登録: $25 (約¥3,750, 一回)
- FCM: 無料
- 合計: MVP段階で **月額 約¥1,500 + 年額 約¥14,850 + 初期¥3,750**

---

## 8. セキュリティ/プライバシ

- デバイス単位でデータを分離 (RLS)
- 通信はTLS
- ローカルDB暗号化は将来対応可能
- 通知ログ保持期間は30〜90日を目安

---

## 9. 今後の拡張余地

- 複数端末同期（Supabase Authを本格利用）
- 通知テンプレートのユーザーカスタム
- カレンダー連携（Google Calendar API等）
- 有料プランや広告の導入

---

## 結論

- **フロントエンド**: Flutter  
- **バックエンド**: Supabase (Micro → Pro移行)  
- **Push通知**: FCM  
- **監視**: Supabase Logs  
- **配布**: App Store (要Developer Program), Google Play  

MVP段階では **最小コストで実現可能**。将来拡張にも対応できる柔軟な構成。
