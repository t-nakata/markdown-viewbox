# ViewBox 記法 (Syntax)

Markdown ViewBox は、シンプルな YAML 形式で画面デザインを定義します。

## 基本構造

## 基本構造

## 基本構造

YAML ファイルは、トップレベルの `config` (画面設定) と、**唯一のルートコンポーネントキー**で構成されます。
`root:` プロパティは不要です。

```yaml
# 1. 画面サイズの設定
size: Mobile # "Mobile", "Web", "Custom"

# 2. タイトル（オプション）
title: "ログイン画面"

# 3. ルート要素 (Scaffold など)
Scaffold:
  appBar:
    title: "Login"
  body:
    Column:
      gap: 10
      children:
        # 子要素もキーで指定します
        - Text:
            text: "Hello"
        - Container:
            child:
              Button:
                text: "Click Me"
```

## コンテナとリスト (Container vs List)

レイアウトには2つの主要なパターンがあります。

- **Container**: 単一の子要素 (`child`) を持ちます。装飾（背景色、縁取り、パディング）に使用されます。
- **Column / Row**: 複数の子要素 (`children`) を持ちます。縦または横方向の配置に使用されます。

```yaml
# Container (単一要素)
Container:
  padding: 20
  child:
    Text:
      text: "Inside Box"

# Column (複数要素)
Column:
  children:
    - Text:
        text: "First"
    - Text:
        text: "Second"
```

## 画面プリセット (Presets)

`size` プロパティで以下のプリセットを使用できます。

| 指定値   | 幅 (px) | 高さ (px) | 備考 |
| :--- | :--- | :--- | :--- |
| `Mobile` | 375 | 812 | スマートフォン向け。ステータスバーとホームインジケータ領域が自動的に確保されます。 |
| `Web`    | 1280 | 800 | デスクトップ/タブレット向け。 |
| `Custom` | 任意 | 任意 | `width`, `height` プロパティで指定します。 |

## 共通プロパティ

多くのコンポーネント（ViewElement）は、以下の基本プロパティを持ちます。

- **width**: 幅 (px)。
- **height**: 高さ (px)。
- **padding**: 内側の余白 (px)。
- **gap**: 子要素間の間隔 (Column/Row)。
