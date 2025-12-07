# Navigation Components

ナビゲーションに関連するコンポーネント群です。

---

## BottomNavigation

画面下部のナビゲーションバーです。`Scaffold` の `bottomNavigation` プロパティで使用します。

### プロパティ
| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `BottomNavigation` | |
| `children` | List | `BottomNavigationItem` のリスト。 |

---

## BottomNavigationItem

BottomNavigation の子要素として使用します。

### プロパティ
| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `BottomNavigationItem` | |
| `label` | string | テキストラベル。 |
| `icon` | string | アイコン名（Iconコンポーネント参照）。 |
| `active` | boolean | 選択状態かどうか。`true` でハイライトされます。 |

---

## FloatingActionButton

画面上に浮いている円形のアクションボタンです。`Scaffold` の `floatingActionButton` プロパティで使用します。

### プロパティ
| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `FloatingActionButton` | |
| `icon` | string | 表示するアイコン名（デフォルトは `+`）。 |

---

## 使用例 (Scaffold内での記述)

```yaml
type: Scaffold
# ...
bottomNavigation:
  type: BottomNavigation
  children:
    - type: BottomNavigationItem
      label: "ホーム"
      icon: "home"
      active: true
    - type: BottomNavigationItem
      label: "検索"
      icon: "search"

floatingActionButton:
  type: FloatingActionButton
  icon: "add"
```
