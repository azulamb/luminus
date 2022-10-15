# 開発用ドキュメント

メモ書きなど。

## 設計思想

ゲームなどの場合最適化など考えないといけないが、そこまでスピードを求めないのであればDOMでモデルを管理できればお手軽に3D描画をできるのではないかという発想で作りました。
基本的には3D空間のタグの中にモデルを突っ込めばよく、それらの位置なども可能な限り属性でなんとかしたいと考えています。

WebGL関連の管理でいえばVAOの管理をDOMでやってしまおうという発想です。

## サーバーを立てて確認

fetchはサーバーを立てず使えないので簡易サーバーを使って確認する。

### Denoで簡易Webサーバー

Denoでは以下のようにする。

#### インストール

```sh
deno install --allow-net --allow-read https://deno.land/std@0.106.0/http/file_server.ts
```

#### 実行

```sh
file_server docs
```

以下のように立ち上がったらブラウザで `http://127.0.0.1:4507/` にアクセスします。（Windowsはこうしないと）

```
HTTP server listening on http://0.0.0.0:4507/
```

## 読み込みについて

TODO: 再度見直す
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
* `lu-world::render()` の実行
* `li-model::rerender()` の実行
  * `rerender` イベントの発行
  * `lu-world` でイベントの補足
  * `lu-world::render()` の実行
    * 他の再描画要請の可能性もあるので描画処理はタイマーを仕掛けている

## 構造について

* Components/
  * Luminusの基本WebComponents
    * Modelsを読み込んで描画する
* Luminus/
  * Luminusの基盤処理。フレームワーク部分。
* Models/
  * Luminusの基本モデル。
  * 立方体や線の外3Dモデルを読み込むものがある。

### Luminus/

### Models/

### Components/
