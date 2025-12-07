# Icon

Material Design アイコンを表示します。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Icon` | |
| `name` | string | アイコン名。 |
| `size` | number | サイズ (px)。デフォルトは 24。 |
| `color` | string | アイコンの色。 |

## 利用可能なアイコン名
現在サポートされているアイコンは以下の通りです：
- `home`
- `search`
- `settings`
- `add`
- `person`
- `menu`
- `arrow_back`
- `check`
- `close`
- `image` (New)

## 使用例

```yaml
Icon:
  name: "home"
  size: 32
  color: "#6200EE"
```
