# Image

画像を表示します。URLを指定するか、プレースホルダーとして使用できます。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Image` | |
| `src` | string | 画像のURL。空の場合はプレースホルダー（グレーの矩形）が表示されます。 |
| `width` | number | 幅 (px)。指定しない場合は利用可能な最大幅になります。 |
| `height` | number | 高さ (px)。デフォルトは 200。 |
| `radius` | number | 角丸の半径 (px)。 (New)|

## 使用例

### 画像指定あり（角丸）
```yaml
type: Image
src: "https://via.placeholder.com/300"
width: 300
height: 200
radius: 12
```

### プレースホルダーとして使用
```yaml
type: Image
height: 150
```
