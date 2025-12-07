# Container (Layout)

要素を配置するための汎用的なコンテナです。
現在は主に縦方向（Vertical）のレイアウトを行います。 `VBox`, `Column` と記述しても動作します。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Container` / `VBox` / `Column` | コンポーネントタイプ。 |
| `children` | List | 子要素のリスト。上から順に配置されます。 |
| `padding` | number | コンテナ内部のパディング (px)。 |
| `gap` | number | 子要素同士の間隔 (px)。 |
| `color` | string | 背景色（例: `#F5F5F5`）。 |
| `width` | number | 幅の指定。指定しない場合は親要素に合わせようとします。 |
| `height` | number | 高さの指定。指定しない場合は内容に合わせて伸縮します。 |

## 使用例

```yaml
type: Container
padding: 16
gap: 8
color: "#EEEEEE"
children:
  - type: Text
    text: "Title"
  - type: Text
    text: "Description text..."
```
