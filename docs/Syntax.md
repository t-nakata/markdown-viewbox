# ViewBox 記法 (Syntax)

Markdown ViewBox は、シンプルな YAML 形式で画面デザインを定義します。

## 基本構造

YAML ファイルは、トップレベルの `config` (画面設定) と `root` (ルート要素) で構成されます。

```yaml
# 1. 画面サイズの設定
size: Mobile # "Mobile", "Web", "Custom"

# カスタムサイズの場合
# size: Custom
# width: 800
# height: 600

# 2. タイトル（オプション）
title: "ログイン画面"

# 3. ルート要素（ここからコンポーネントツリーが始まります）
root:
  type: Scaffold
  appBar:
    title: "Login"
  body:
    type: Container
    children:
      - type: Text
        text: "Hello"
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
- **gap**: 子要素間の間隔 (Container等)。
