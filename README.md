# markdown-viewbox

Markdown (YAML) で描く、画面デザインのブループリント。
Material Design に準拠したワイヤーフレームを素早く生成します。

[![Demo](https://img.shields.io/badge/Demo-Live-success)](https://md-viewbox.web.app)

[デモサイト (ViewBox Playground)](https://md-viewbox.web.app) で今すぐ試せます。

## 特徴
- **YAMLベース**: 記述量が少なく、読みやすい Flutter ライクな構文。
- **Web Playground**:
  - **Drag & Drop**: コンポーネントパレットから直感的にUIを構築。
  - **Interactive Editor**: プレビューをクリックしてプロパティを直接編集。
  - **SVG Preview**: リアルタイムで SVG を生成・確認。
- **Material Design**: デフォルトで見栄えの良いコンポーネント。

## ドキュメント

### 記法・基本
- [ViewBox 記法 (Syntax)](docs/Syntax.md)

### コンポーネントリファレンス
- **構造 (Structure)**
  - [Scaffold](docs/components/Scaffold.md) (画面構造、AppBar、BottomNav)
  - [Container / Layout](docs/components/Layout.md) (レイアウト、余白)

- **入力・操作 (Inputs & Actions)**
  - [Button](docs/components/Button.md) (ボタン、カスタムスタイル)
  - [EditText](docs/components/EditText.md) (入力フォーム、ラベル)
  - [Link](docs/components/Link.md) (リンクテキスト)

- **メディア・表示 (Media & Display)**
  - [Text](docs/components/Text.md) (テキスト)
  - [Image](docs/components/Image.md) (画像、角丸)
  - [Icon](docs/components/Icon.md) (アイコン)

- **ナビゲーション (Navigation)**
  - [Navigation Components](docs/components/Navigation.md) (BottomNavigation, FAB)

## クイックスタート

1. YAMLファイルを作成します (例: `design.yaml`)
   ```yaml
   size: Mobile
   title: Feature Demo
   
   Scaffold:
     appBar:
       title: "My App"
       centerTitle: true
     body:
       Column:
         padding: 20
         gap: 16
         children:
           - Text:
               text: "Hello ViewBox"
               size: 24
           - Image:
               height: 150
               radius: 10
           - Button:
               text: "Get Started"
               variant: "primary"
     floatingActionButton:
        icon: add
   ```

2. 変換を実行します
   ```bash
   npx ts-node src/index.ts design.yaml
   ```

3. `design.svg` が生成されます。

## ライセンス
ISC
