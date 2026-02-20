# 相続税 簡易計算ツール

相続税の概算額を簡単に計算できるWebツールです。Next.js 14 (App Router) + Tailwind CSS + Anthropic Claude API で構築されています。

## 機能

- 遺産総額・相続人情報・各種控除を入力して相続税の概算を算出
- 計算ステップ（非課税枠・基礎控除・法定相続分按分）を表形式で表示
- Claude AI（Haiku / Sonnet）による日本語解説
- ツールURLのクリップボードコピー機能

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic SDK** (`@anthropic-ai/sdk`)

## ローカル開発

```bash
# 依存パッケージのインストール
npm install

# .env.local を作成して API キーを設定
echo "ANTHROPIC_API_KEY=your_api_key_here" > .env.local

# 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## デプロイ手順（Vercel）

1. GitHubリポジトリを作成して push
2. [Vercel](https://vercel.com) にインポート
   - **Application Preset: Next.js** を選択
3. Environment Variables に `ANTHROPIC_API_KEY` を設定
4. デプロイ実行

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic API キー（必須） |

> `.env.local` は `.gitignore` に含まれており、リポジトリにはコミットされません。

## 免責事項

本ツールは概算の目安を提供するものです。実際の相続税額は個別の状況によって異なります。正確な税額の算定は税理士にご相談ください。
