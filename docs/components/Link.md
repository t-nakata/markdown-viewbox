# Link

クリッカブルなリンクテキストを表現します（ワイヤーフレーム上では下線付きテキストとして表示されます）。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Link` | |
| `text` | string | リンクテキスト。 |
| `url` | string | リンク先URL（現在は視覚的な表現のみに使われます）。 |
| `size` | number | フォントサイズ。 |
| `color` | string | 文字色。デフォルトは青色 (`#1E88E5`)。 |

## 使用例

```yaml
Link:
  text: "利用規約"
  url: "https://example.com/terms"
  size: 14
  color: "#1E88E5"
```
