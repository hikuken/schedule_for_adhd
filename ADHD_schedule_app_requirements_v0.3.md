# ADHD向けスケジュールアプリ 要件定義書（MVP v0.3）

最終更新: 2025-09-27  
作成者: 個人開発（Java / Firebase / JavaScript 想定）  
対象: **最小構成（UI 2画面＋モーダル＋終了フォロー通知）**

---

## 1. 目的・概要
ADHD特性（着手困難・記憶負荷）を軽減するため、**カレンダーで予定を把握**し、**今日やることを最小操作で完了**まで導く。  
本MVPは以下を提供する。
- フッターの2ボタンナビ（**スケジュール / 今日**）
- **スケジュール画面**（祝日・タスク表示）
- **今日のタスク画面**（未完了／完了の2列）
- **タスク追加モーダル**（新規作成・編集・削除）
- **終了フォロー通知**（未完了タスクへのランダム再通知）

> 注: **実装方針は本書に含めない。**

---

## 2. スコープ（本MVPで提供）
- フッターナビ: **スケジュール / 今日** の2ボタン
- スケジュール画面: 月カレンダー、祝日表示、タスク存在表示、日付タップでモーダル起動
- 今日のタスク画面: **タスク列**（開始時刻昇順）／**完了列**（完了時刻降順）、タスク追加ボタン、チェックで完了移動、カードタップで編集
- タスク追加モーダル: **タスクの内容 / 開始時間 / 終了時間 / 繰り返し（毎日・毎週・毎月・毎年） / サブタスク / メモ**、**保存 / 削除**
- **終了フォロー通知**: 終了時刻を過ぎても未完了のタスクに対し、**完了するまで**ランダムなタイミングで**継続通知**

※ 外部カレンダー同期、開始前通知、統計/学習、アカウント機能などは非スコープ。

---

## 3. 画面・ナビゲーション要件

### 3.1 グローバルUI（フッターナビ）
- **UI-001**: フッターに2ボタン（**スケジュール / 今日**）
- **UI-002**: 現在地のタブを強調表示（色/アイコン/下線のいずれか）

### 3.2 スケジュール画面
- **CAL-001**: **月カレンダー表示**（iOS標準「カレンダー」の月表示に準拠）
- **CAL-002**: **日本の祝日**を表示（色/ドット/ラベルのいずれか）
- **CAL-003**: **タスク存在**を簡易表示（ドット/細バー等、複数件時は複数ドットまたは+件数）
- **CAL-004**: **日付セルタップ**で**タスク追加モーダル**（初期日付＝タップ日）
- **CAL-005**: 月移動（左右スワイプ/ナビゲーション）

### 3.3 今日のタスク画面
- **TODAY-001**: **2列レイアウト**（左: タスク列 / 右: 完了列）
- **TODAY-002**: タスク列上部に**タスク追加ボタン**（初期日付＝今日）
- **TODAY-003**: **タスク列**は**開始時刻昇順**（未設定は末尾）、各カード左に**空のチェック**
- **TODAY-004**: **チェック押下**でタスクを**完了列**へ移動し、タスク列から削除
- **TODAY-005**: **完了列**は**完了時刻降順**で表示
- **TODAY-006**: タスクカード本体タップで**タスク追加モーダル（編集）**を開く

### 3.4 タスク追加モーダル（新規/編集共通）
- **MODAL-001 入力項目**:
  - **タスクの内容**（必須）
  - **開始時間**（任意）
  - **終了時間**（任意 / 開始≦終了）
  - **繰り返し**（任意 / 毎日・毎週・毎月・毎年）
  - **サブタスク**（0..n）
  - **メモ**
- **MODAL-002 操作**: **保存 / 削除（編集時のみ活性）**
- **MODAL-003 初期値**: 新規＝呼出元日（カレンダー日/今日）、編集＝既存値
- **MODAL-004 繰り返し解釈**:
  - 毎週＝開始日の**曜日**
  - 毎月＝開始日の**日付**（31日等がない月は**最終日**へ丸め）
  - 毎年＝**月日**（2/29は**2/28**に丸め）

---

## 4. 機能要件（Functional Requirements）

### 4.1 タスク管理
- **FR-001**: タスクの新規作成（必須=タスクの内容）
- **FR-002**: タスクの編集
- **FR-003**: タスクの削除（編集時のみ）
- **FR-004**: 開始/終了、繰り返し、サブタスク、メモの付与
- **FR-005**: 今日画面での**チェック操作**により**完了**へ移動
- **FR-006**: スケジュール画面に**祝日**と**タスク存在**を表示
- **FR-007**: カレンダー日付タップで当該日を初期値として新規作成
- **FR-008**: 今日画面の追加ボタンから新規作成（初期日付＝今日）

### 4.2 表示・並び順
- **FR-009**: タスク列＝**開始時刻昇順**（未設定は末尾）
- **FR-010**: 完了列＝**完了時刻降順**
- **FR-011**: カレンダー初期表示＝**当月**

### 4.3 バリデーション
- **FR-012**: 「タスクの内容」未入力は保存不可
- **FR-013**: 開始/終了の両方が入力されている場合は**開始≦終了**
- **FR-014**: 繰り返し設定に必要な開始情報が欠落している場合は保存不可

### 4.4 通知（終了フォロー通知）
- **NTF-001 対象タスク**:  
  - **終了時間が設定**され、終了時間の時点で**未完了**（status ≠ done）のタスク
- **NTF-002 初回通知ウィンドウ**:  
  - **終了時間〜終了時間+1時間**の範囲で**ランダムな1時刻**に通知
- **NTF-003 再通知ウィンドウ（継続）**:  
  - 初回通知時刻を **T₁** とする。**未完了**であれば、以降**直前の通知時刻 Tₙ〜Tₙ+1時間**の範囲で**ランダムな1時刻**に**次回通知**を行う  
  - この再通知を**タスクが完了するまで継続**する（回数上限なし）
- **NTF-004 抑止条件**:  
  - 通知予定時刻の時点で当該タスクが**完了**している場合、以降の通知は**行わない**
  - **終了時間未設定**のタスクは対象外
- **NTF-005 文言**:  
  - 「**『{タスクの内容}』は完了しましたか？**」  
  - `{タスクの内容}` に当該タスクのタイトルを差し込み
- **NTF-006 繰り返しタスク**:  
  - 各**発生回（インスタンス）**を個別に判定。未完了なら上記ロジックを適用
- **NTF-007 権限と前提**:  
  - 端末の**通知許可**が得られていない場合、通知は表示されない
- **NTF-008 タイムゾーン/言語**:  
  - **Asia/Tokyo**、日本語固定（本MVP）

---

## 5. 非機能要件（NFR）
- **NFR-001**: 主要操作（画面遷移・保存）の体感応答は概ね500ms以内（端末/回線依存）
- **NFR-002**: 既定タイムゾーン **Asia/Tokyo**
- **NFR-003**: タップ領域44pt以上、OS文字サイズに追従
- **NFR-004**: データ保持はローカル or 同期ありのいずれか（本MVPではどちらか一方で可）
- **NFR-005**: プライバシー最小。通知本文はタスクタイトルのみを含む
- **NFR-006**: オフラインでも閲覧/追加/完了が最低限成立
- **NFR-007**: 通知は端末/OS設定の影響により遅延/未達が発生し得る

---

## 6. データ要件（Supabaseスキーマ v0.3）

### 6.1 テーブル一覧（MVP）
| 論理名 | 物理名 | 用途 | 備考 |
|---|---|---|---|
| プロファイル | profiles | Supabase Authと連動した利用者メタ情報 | 匿名利用時は行がなくても可 |
| デバイス | devices | 端末識別子とFCMトークン管理 | RLSの所有判定キー。匿名運用時の主体 |
| タスクシリーズ | task_series | 繰り返し設定と共通メタデータ | repeat_type='none'で単発タスクを表現 |
| タスクインスタンス | task_instances | 日毎のタスク実体（UIと通知はこれを参照） | series と 1:n |
| サブタスク | task_subtasks | タスクインスタンス配下のサブタスク | 並び順 position、完了管理 is_completed |
| 終了フォロー通知ジョブ | followup_jobs | 未完了タスク向けの再通知スケジューラ | task_instances と 1:1 |
| 通知履歴 | notification_logs | Push送信の履歴・ステータス記録 | デバッグ／分析用途 |
| 祝日マスタ | holidays | 日本の祝日データ | 読み取り専用。必要に応じて更新バッチ |

### 6.2 テーブル定義詳細

#### profiles
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | auth.uid() | Supabase AuthのユーザーID。匿名利用時はレコード未作成でも可 |
| display_name | text |  |  | 任意の表示名 |
| created_at | timestamptz | ✓ | now() | 作成日時 |
| updated_at | timestamptz | ✓ | now() | 更新日時。`updated_at`はトリガーで自動更新 |

#### devices
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | gen_random_uuid() | 端末レコードID |
| device_key | text | ✓ |  | 端末内で生成・保持する一意キー。`UNIQUE` |
| profile_id | uuid |  |  | `profiles.id`。ログイン時に紐付け（null許容） |
| platform | text | ✓ |  | `'ios' / 'android' / 'web'` 等 |
| timezone | text | ✓ | 'Asia/Tokyo' | 通知・表示用タイムゾーン |
| locale | text |  | 'ja-JP' | 端末ロケール（UI調整用） |
| fcm_token | text |  |  | 最新FCMトークン。無効化時はnull |
| app_version | text |  |  | SemVer形式想定 |
| last_seen_at | timestamptz |  |  | 最終アクセス日時 |
| created_at | timestamptz | ✓ | now() | 作成日時 |
| updated_at | timestamptz | ✓ | now() | 更新日時 |

#### task_series
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | gen_random_uuid() | タスクシリーズID |
| profile_id | uuid |  |  | `profiles.id`。匿名利用時はnull |
| device_id | uuid | ✓ |  | `devices.id`（RLS用所有者） |
| title | text | ✓ |  | デフォルトのタスク名（モーダル初期値） |
| base_note | text |  |  | デフォルトのメモ |
| timezone | text | ✓ | 'Asia/Tokyo' | 発生基準のタイムゾーン |
| first_event_date | date | ✓ |  | 初回発生日（繰り返しの基準日） |
| default_start_time | time |  |  | 既定の開始時刻（null=未設定） |
| default_end_time | time |  |  | 既定の終了時刻（null=未設定） |
| repeat_type | task_repeat_type | ✓ | 'none' | 繰り返し種別 |
| repeat_interval | smallint | ✓ | 1 | 繰り返し間隔。例: 2なら隔日 |
| repeat_weekday | smallint |  |  | `0(日)〜6(土)`。weekly時に使用 |
| repeat_day_of_month | smallint |  |  | monthly時に使用。31日は末日に繰り上げ |
| repeat_month | smallint |  |  | yearly時の月(1-12) |
| repeat_end_date | date |  |  | 繰り返し終了日。null=無期限 |
| is_active | boolean | ✓ | true | falseで今後のインスタンス生成を停止 |
| created_at | timestamptz | ✓ | now() | 作成日時 |
| updated_at | timestamptz | ✓ | now() | 更新日時 |
| deleted_at | timestamptz |  |  | 論理削除（履歴保持用。null=有効） |

#### task_instances
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | gen_random_uuid() | タスクインスタンスID |
| series_id | uuid | ✓ |  | `task_series.id`。`ON DELETE CASCADE` |
| profile_id | uuid |  |  | `profiles.id`。シリーズと同じ値を持つ |
| device_id | uuid | ✓ |  | `devices.id` |
| occurrence_date | date | ✓ |  | UI・カレンダーで扱う日付 |
| start_at | timestamptz |  |  | `occurrence_date`に`default_start_time`を適用した値（null可） |
| end_at | timestamptz |  |  | 終了日時（通知の初回基準） |
| status | task_status | ✓ | 'todo' | 進行状態 |
| done_at | timestamptz |  |  | 完了日時（完了列表示 / 通知抑止） |
| note | text |  |  | インスタンス固有のメモ |
| carry_over_source_id | uuid |  |  | 前日からの繰り越し元インスタンスID（null許容） |
| created_at | timestamptz | ✓ | now() | 作成日時 |
| updated_at | timestamptz | ✓ | now() | 更新日時 |
| deleted_at | timestamptz |  |  | 論理削除（UIから削除時） |

> 制約例: `UNIQUE (series_id, occurrence_date)`（同一シリーズの同日重複生成を防止）、`CHECK (start_at IS NULL OR end_at IS NULL OR start_at <= end_at)`。

#### task_subtasks
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | gen_random_uuid() | サブタスクID |
| task_instance_id | uuid | ✓ |  | `task_instances.id`（`ON DELETE CASCADE`） |
| title | text | ✓ |  | サブタスク名 |
| is_completed | boolean | ✓ | false | 完了状態。繰り返し生成時に初期化 |
| position | smallint | ✓ | 0 | 表示順。フロント側で並び替え管理 |
| created_at | timestamptz | ✓ | now() | 作成日時 |
| updated_at | timestamptz | ✓ | now() | 更新日時 |

#### followup_jobs
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | gen_random_uuid() | ジョブID |
| task_instance_id | uuid | ✓ |  | `task_instances.id`。`UNIQUE`制約 |
| device_id | uuid | ✓ |  | 通知対象端末 |
| next_fire_at | timestamptz | ✓ |  | 次回通知予定時刻 |
| last_fired_at | timestamptz |  |  | 直近の通知実行時刻 |
| retry_count | integer | ✓ | 0 | 再通知回数（初回0） |
| status | followup_job_status | ✓ | 'scheduled' | ジョブ状態 |
| payload | jsonb |  | '{}'::jsonb | 通知本文やテンプレート差分 |
| created_at | timestamptz | ✓ | now() | 作成日時 |
| updated_at | timestamptz | ✓ | now() | 更新日時 |

#### notification_logs
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| id | uuid | ✓ | gen_random_uuid() | 通知ログID |
| followup_job_id | uuid |  |  | `followup_jobs.id`（null=手動送信等） |
| task_instance_id | uuid |  |  | 対象タスク（解析用） |
| device_id | uuid | ✓ |  | 実際に送信した端末 |
| status | notification_status | ✓ | 'queued' | 送信状態 |
| sent_at | timestamptz |  |  | FCMへリクエストした時刻 |
| delivered_at | timestamptz |  |  | 配信確認時刻（未取得ならnull） |
| response_code | text |  |  | FCMレスポンスコード |
| response_payload | jsonb |  | '{}'::jsonb | FCMレスポンス全文（デバッグ用） |
| created_at | timestamptz | ✓ | now() | 監査用タイムスタンプ |

#### holidays（読み取り専用）
| フィールド | 型 | 必須 | デフォルト | 説明 |
|---|---|---:|---|---|
| holiday_date | date | ✓ |  | 祝日の日付（PK） |
| name | text | ✓ |  | 祝日名（例: 成人の日） |
| region | text | ✓ | 'JP' | 対象地域コード |
| source | text |  |  | データソース（内閣府CSV等） |
| updated_at | timestamptz | ✓ | now() | データ更新日時 |

### 6.3 Enum定義
| Enum名 | 値 | 説明 |
|---|---|---|
| task_status | `todo`, `done` | 今日画面の列制御・通知抑止に使用 |
| task_repeat_type | `none`, `daily`, `weekly`, `monthly`, `yearly` | 繰り返し種別 |
| followup_job_status | `scheduled`, `paused`, `completed`, `cancelled`, `error` | 終了フォロー通知ジョブの状態管理 |
| notification_status | `queued`, `sent`, `delivered`, `failed` | 通知履歴の配信状態 |

### 6.4 ビジネスロジック補足
- **タスク生成**: モーダル保存時に `task_series` と当該日の `task_instances` を同時作成。`repeat_type <> 'none'` の場合は Edge Function / cron で先14〜30日分の `task_instances` を先行生成し、サブタスクは最新インスタンスを複製する。
- **完了処理**: 今日画面のチェック操作で `task_instances.status = 'done'`, `done_at = now()` に更新し、紐づく `followup_jobs` を `status='completed'` へ遷移。未完了の場合のみ `followup_jobs.next_fire_at` をローリング更新。
- **削除**: 編集モーダルの削除は `task_instances.deleted_at` を設定（履歴保持）。シリーズ全体削除は `task_series.deleted_at` を設定し、新規インスタンス生成を停止後に既存行も段階的にパージ。
- **通知スキャン**: pg_cron で `next_fire_at <= now()` の `followup_jobs` を取得し、送信成功時に `last_fired_at` 更新・`next_fire_at` を 0〜1時間の乱数で再計算。
- **祝日同期**: `holidays` は管理者のみ書き込み可。定期的なCSV取り込み関数を用意。

### 6.5 RLS / インデックス方針
- **RLS**: `devices` は `auth.jwt()` に含める `device_key` で `device_key = current_setting('request.jwt.claim.device_key', true)` を検証。`task_series`, `task_instances`, `task_subtasks`, `followup_jobs`, `notification_logs` は `(profile_id = auth.uid()) OR (device_id = owner_device_id())` でアクセス制御。
- **主なインデックス**: `task_instances(device_id, occurrence_date DESC)`、`task_instances(status, occurrence_date)`、`followup_jobs(next_fire_at)`、`notification_logs(device_id, sent_at DESC)`。
- **トリガー**: `updated_at` 自動更新と `start_at <= end_at` バリデーション、タスク完了時の `followup_jobs` 自動停止をPL/pgSQLトリガーで実装。
- **ビュー**: フロント向けに `v_today_tasks(device_id, occurrence_date)` を作成し、`task_instances` と `task_subtasks` を結合した読み取り専用ビューを提供予定。

---

## 7. 祝日データの扱い
- 対象は**日本の祝日**（当年＋翌年を推奨）
- 実装方法（静的JSON/算出）は本書では規定しない

---

## 8. エラーハンドリング（例）
- 必須未入力: 「タスクの内容を入力してください」
- 時刻不整合: 「終了時間は開始時間以降にしてください」
- 保存失敗: 「保存に失敗しました。通信環境をご確認ください」
- 通知非許可（情報）: 「通知を受け取るには端末設定で許可が必要です」

---

## 9. 受け入れ基準（UAT）
1. **スケジュール/今日**ボタンで正しく画面遷移できる  
2. **スケジュール画面**で月カレンダー表示、祝日・タスク存在が視認できる  
3. 日付タップで**タスク追加モーダル**が開き、当該日が初期値となる  
4. **今日のタスク画面**でタスク追加→保存ができる  
5. タスク列の**チェック**でタスクが**完了列**へ移動し、タスク列から削除される  
6. タスクカードタップで**編集モード**のモーダルが開き、編集保存/削除ができる  
7. 並び順: タスク列＝開始時刻昇順（未設定末尾）、完了列＝完了時刻降順  
8. バリデーション: タイトル必須、開始≦終了  
9. **終了フォロー通知**:  
   - 終了時刻設定かつ未完了のタスクに対し、**終了〜+1h**で初回通知が1回来る  
   - 以降**直前通知時刻〜+1h**のランダム時刻で**完了まで継続**して通知される（回数上限なし）  
   - 通知予定時刻に**完了済み**なら以降の通知は**送信されない**  
   - 通知文言が「**『{タスクの内容}』は完了しましたか？**」である

---

## 10. 非スコープ（将来）
- 開始前JIT通知、サマリー通知、エスカレーション設計
- 外部カレンダー連携、アカウント/複数端末同期
- 統計/レポート、行動最適化
- 繰り返し例外（この回だけ変更・スキップ）

---

## 11. 前提・制約
- 通知表示には**端末の通知許可**が必要  
- タスクの重複/オーバーラップは許容  
- **実装方式・基盤は本書の対象外**（後続工程で定義）
