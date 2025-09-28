# Repository Guidelines

このファイルの指示は、リポジトリ直下配下の全ディレクトリに適用されます。詳細要件は `ADHD_schedule_app_requirements_v0.3.md`、技術設計は `ADHD_schedule_app_tech_design.md` を参照してください。

## プロジェクト構成 & モジュール配置
- `lib/` アプリ本体（将来目安: `features/`, `widgets/`, `services/`, `data/`）。
- `test/` 単体・ウィジェットテスト（`*_test.dart`）。
- `android/ ios/ macos/ windows/ linux/ web/` 各プラットフォーム資材。
- アセットは `pubspec.yaml` の `flutter.assets` に登録（例: `assets/images/`）。

## ビルド・実行・テスト
- 依存取得: `flutter pub get`
- 実行: `flutter run`（例: `-d macos`/`ios`/`android`/`chrome`）
- テスト: `flutter test`（カバレッジ: `flutter test --coverage`）
- 静的解析: `flutter analyze`
- フォーマット: `dart format .`（差分確認は `--output=none --set-exit-if-changed`）
- ビルド: `flutter build <apk|ios|macos|web|windows|linux>`

## コーディングスタイル & 命名
- Dart 標準 + `analysis_options.yaml`（`flutter_lints`）に準拠。インデントは2スペース。
- ファイル: `snake_case.dart`、クラス/enum: `PascalCase`、メソッド/変数: `lowerCamelCase`、プライベート: 先頭に`_`。
- import順序は「dart/flutter → package → 相対パス」を推奨。不要な`print`/未使用コードは削除。

## テスト指針
- フレームワーク: `flutter_test`。テストは `test/` に配置し `*_test.dart` を付与。
- 重要ロジック（日時計算・繰り返し・状態遷移）は必ずテストを追加。
- 例: `test/widgets/today_list_test.dart`、`test/services/schedule_rules_test.dart`。

## コミット & Pull Request
- 形式は Conventional Commits を推奨: `feat: ...` / `fix: ...` / `refactor: ...` / `test: ...` / `docs: ...`。
- スコープ例: `ui`, `data`, `infra`, `ios`, `android`（例: `feat(ui): 今日画面の並び替えを追加`）。
- PR には: 目的/変更点、関連Issue（`#123`）、UI変更はスクリーンショット、確認事項（`analyze`/`test`実行済）を記載。

## セキュリティ & 設定
- APIキーや秘密情報をコミットしない。`--dart-define` または `dart-define-from-file` 等で注入。
- 認証・通知設定ファイルを追加する場合は `.gitignore` を更新し、共有手順を README に追記。

## アーキテクチャ概要（要点）
- フロント: Flutter。バックエンド: Supabase（Postgres/Edge Functions）。通知: FCM（`firebase_messaging`/`flutter_local_notifications`）。
- 詳細は設計書の「通知仕様」「データモデル」「API設計例」を参照し、整合性を保って実装してください。

