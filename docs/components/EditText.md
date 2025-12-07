# EditText (Input)

ユーザー入力を受け付けるテキストフィールドです。

## プロパティ

| プロパティ名 | 型 | 説明 |
| :--- | :--- | :--- |
| `type` | `EditText` / `Input` | |
| `label` | string | フィールド名（フローティングラベルの位置に表示）。(New) |
| `value` | string | 入力済みの値。 (New) |
| `placeholder` | string | 値が空の時に表示されるヒントテキスト（旧 `hint`）。 (New) |
| `borderColor` | string | 枠線の色。 |

## 使用例

### ラベルと値（入力済み状態）
```yaml
type: EditText
label: "メールアドレス"
value: "user@example.com"
```

### プレースホルダーのみ
```yaml
type: EditText
placeholder: "検索キーワードを入力..."
```

### 組み合わせ
```yaml
type: EditText
label: "自己紹介"
placeholder: "ここに入力してください"
```
