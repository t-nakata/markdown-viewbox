# Layout Components

画面のレイアウトを構築するためのコンポーネント群です。

## コンポーネントの種類

### Container
単一の子要素をラップし、パディング、サイズ、背景色などを適用します。
- `padding`: 内側の余白
- `width` / `height`: 固定サイズ (省略時は子のサイズまたは親の制約に従う)
- `color`: 背景色
- `child`: **単一の子要素**

### Column (Vertical)
子要素を縦方向に並べます。
- `gap`: 子要素間の間隔
- `children`: **子要素のリスト**

### Row (Horizontal)
子要素を横方向に並べます。
- `gap`: 子要素間の間隔
- `children`: **子要素のリスト**

## 使用例

```yaml
# Column Layout
Column:
  gap: 16
  children:
    - Text:
        text: "Header"
    
    # Container Wrapper
    - Container:
        padding: 24
        color: "#E3F2FD"
        child:
          Row:
            gap: 8
            children:
               - Icon:
                   name: "check"
               - Text:
                   text: "Verified"
```
