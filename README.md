# markdown-viewbox

Markdown (YAML) で描く、画面デザインのブループリント。
Material Design に準拠したワイヤーフレームを素早く生成します。

## 特徴
- **YAMLベース**: 記述量が少なく、読みやすい。
- **3つの画面サイズ**: Web, Mobile, Custom。
- **Material Design**: デフォルトで見栄えの良いコンポーネント。

## ドキュメント

### 記法・基本
- [ViewBox 記法 (Syntax)](docs/Syntax.md)

### コンポーネントリファレンス
コンポーネントごとの詳細ドキュメントです。

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
   root:
     type: Scaffold
     appBar:
       title: "My App"
       centerTitle: true
     body:
       type: Container
       padding: 20
       children:
         - type: Text
           text: "Hello ViewBox"
           size: 24
         - type: Image
           height: 150
           radius: 10
         - type: Button
           text: "Get Started"
           variant: "primary"
   ```

2. 変換を実行します
   ```bash
   npx ts-node src/index.ts design.yaml
   ```

3. `design.svg` が生成されます。

## ライセンス
ISC
