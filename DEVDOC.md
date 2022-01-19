# 開発用ドキュメント

メモ書きなど。

## 読み込みについて

* `Luminus` の作成
  * `Luminus.matrix` の作成
  * `Luminus.createSupport` の作成
  * `Luminus.createProgram` の作成
  * `Luminus.models` の作成
* `DOMContentLoaded` もしくはすでに読み込み済みなら `lu-model` の定義
  * `lu-model` の定義後 `lu-world` の定義
    * `lu-world` の定義語にその他WebComponentsの定義
  * `lu-model` の定義後 `Luminus.model` の作成

## 描画について

* `lu-world` 初期化後に一度 `lu-world::render()` の実行
  * `lu-model::render()` の実行
    * 描画可能なら描画
    * 読み込み開始していないなら `LuminusModel::load()` の後 `LuminusModel::prepare()` の後 `LuminusModel::render()` を実行
    * 読み込み準備未完了なら `LuminusModel::prepare()` の後 `LuminusModel::render()` を実行
* `lu-world::render()` の実行
* `li-model::rerender()` の実行
  * `rerender` イベントの発行
  * `lu-world` でイベントの補足
  * `lu-world::render()` の実行
