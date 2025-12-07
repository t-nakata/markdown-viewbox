# Text

単純なテキストを表示します。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Text` | |
| `text` | string | 表示する文字列。 |
| `size` | number | フォントサイズ (px)。デフォルトは 16。 |
| `color` | string | 文字色。 |
| `weight` | string | フォントの太さ (`bold`, `normal`, `500` 等)。 |

## 使用例

```yaml
Text:
  text: "Hello World"
  size: 24
  weight: "bold"
  color: "#333333"
```
