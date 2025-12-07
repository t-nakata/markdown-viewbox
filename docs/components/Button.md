# Button

アクションボタンを表示します。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Button` | |
| `text` | string | ボタンのラベル。 |
| `variant` | string | スタイルプリセット。`primary` (デフォルト), `secondary`, `outline`, `ghost`。 |
| `backgroundColor` | string | 背景色を上書き指定します。(New) |
| `borderColor` | string | ボーダー色を指定します（`variant: outline` と併用などで有効）。(New) |
| `textColor` | string | テキスト色を指定します。(New) |
| `radius` | number | 角丸の半径 (px)。デフォルトは 4。(New) |
| `width` | number | ボタンの幅。指定しない場合はテキスト長に合わせて自動調整されます。(New) |

## 使用例

### 標準ボタン
```yaml
# Primary Button
Button:
  text: "送信"
  variant: "primary"
  width: 200

# Outline Button
Button:
  text: "キャンセル"
  variant: "outline"
  borderColor: "#FF0000"
  textColor: "#FF0000"

# Custom Button
Button:
  text: "カスタム"
  backgroundColor: "#000000"
  textColor: "#FFFFFF"
  radius: 8
```
