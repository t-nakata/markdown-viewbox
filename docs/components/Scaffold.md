# Scaffold

画面の基本的なレイアウト構造を提供するコンポーネントです。
Material Design の Scaffold に倣い、AppBar、Body、BottomNavigation、FloatingActionButton のスロットを提供します。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `Scaffold` | |
| `appBar` | Object | 画面上部のアプリケーションバー設定。 |
| `body` | Component | 画面中央のメインコンテンツ。通常は `Container` や `VBox` を指定します。 |
| `bottomNavigation` | Component | 画面下部のナビゲーションバー。`BottomNavigation` コンポーネントを指定します。 |
| `floatingActionButton` | Component | 画面右下に浮くアクションボタン。`FloatingActionButton` コンポーネントを指定します。 |

## AppBar 設定

`appBar` プロパティ配下の設定項目です。

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `title` | string | タイトルテキスト。 |
| `backButton` | boolean | `true` の場合、左側に「戻る」アイコンを表示します。(New) |
| `centerTitle` | boolean | `true` の場合、タイトルを中央寄せします。(New) |
| `backgroundColor` | string | 背景色を指定します（例: `#3f51b5`）。デフォルトは紫。 (New) |

## 使用例

```yaml
type: Scaffold
appBar:
  title: "詳細画面"
  backButton: true
  centerTitle: true
  backgroundColor: "#1976D2"
body:
  type: Container
  children:
    - type: Text
      text: "メインコンテンツ"
bottomNavigation:
  type: BottomNavigation
  children:
    - type: BottomNavigationItem
      label: "Home"
      icon: "home"
      active: true
floatingActionButton:
  type: FloatingActionButton
  icon: "add"
```
