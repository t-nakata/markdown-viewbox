# markdown-viewbox

Markdown (YAML) で描く、画面デザインのブループリント。
Material Design に準拠したワイヤーフレームを素早く生成します。

## 特徴
- **YAMLベース**: 記述量が少なく、読みやすい。
- **3つの画面サイズ**: Web, Mobile, Custom。
- **Material Design**: デフォルトで見栄えの良いコンポーネント。

## 使い方

1. YAMLファイルを作成します (例: `design.yaml`)
   ```yaml
   screen: Mobile
   root:
     type: Scaffold
     appBar:
       title: "My App"
     body:
       type: Container
       padding: 16
       gap: 16
       children:
         - type: Text
           text: "Hello World"
         - type: Button
           text: "Action"
   ```

2. 変換を実行します
   ```bash
   npx ts-node src/index.ts design.yaml
   ```

3. `design.svg` が生成されます。

## コンポーネント一覧

Material Design (Flutter/Android風) の命名規則を採用しています。

### 構造
- **Scaffold**: 画面の基本構造。
  - `appBar`: `{ title: string }`
  - `body`: メインコンテンツ
- **Container**: 多目的なコンテナ（レイアウト、余白、背景）。旧 `Box`/`VBox`。
  - `gap`: 子要素の間隔
  - `padding`: パディング
  - `color`: 背景色
  - `children`: 子要素リスト

### UI要素
- **Text**: テキスト。
  - `text`: 文字列
  - `size`: サイズ
  - `color`: 色
- **Button**: ボタン。
  - `text`: ラベル
  - `variant`: `primary` | `secondary`
- **EditText**: 入力フォーム。
  - `label`: ラベル
  - `hint`: ヒントテキスト

## ライセンス
ISC
