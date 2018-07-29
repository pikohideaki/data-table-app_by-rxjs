# RxJSを使ってコーディングの効率を上げる

## 目標

* RxJSを使ってJavaScriptソースコードを改善
* RxJSを使った場合と使わない場合のソースコード比較
* 手軽なRxJSの導入の紹介
* Observableを分かった気になる
* 「リアクティブ」の意味を掴む


## 要約

* RxJSとは、Reactive Extensions for JavaScript の略称です。
    「リアクティブ」とはどういうことかは後ほど説明します。
* （雑な説明）Observableとは、
    「値が更新されたときに発火する（アクションを起こす）変数」です。
    「値の更新を別の変数へ伝播する変数」
    あるいは
    「値の更新を監視できる変数」
    と言ってもいいかもしれません。
* Observableを使うと、
    * 変数同士の依存関係を記述するだけでよい
    * 処理の流れが追いやすい
    * 可読性の高いコードが書ける

    などの理由でバグの少ないコードが書きやすくなります。


## サンプル

例として、以下のリンクにあるページネーションとフィルタ機能の付いたデータテーブルを実装します。


ソースコードも先に貼っておきます（のちほど解説していきます）。

* [ソースコード (DataTableApp)](https://codepen.io/pikohideaki/pen/qKPvEy?editors=0010)

* [ソースコード (DataTableAppByRxJS)](https://codepen.io/pikohideaki/pen/LrLzLX?editors=0010)

* ディレクトリ構成

```
/
├ index.html
├ styles.css
└ js/
   ├ common.js
   ├ tableApp.js
   ├ tableApp_suppressed.js
   └ tableApp_rxjs.js
```


### 共通の説明

* JavaScriptについて補足

    * `let x`で変数`x`を定義します。
        `const y`は再代入できない変数`y`を定義しています。
    * `(/* 引数 */) => /* 返り値 */`
        や
        `(/* 引数 */) => { /* 処理 */ }`
        などの構文は関数を表します。
        （例：
            `const add = ((x, y) => x + y)`,
            `const sqrt = (x => x * x)`
            など）
    * `A.addEventListener(B, C)`は、要素AにBという種類のイベントが起きたときに、
        関数Cに記述した処理を行うように登録する構文です。
        例えば Aが`document.getElementById('first-name')`、
        Bが`'input'`、Cが`(event) => console.log(event.target.value)`とすると、
        first-nameというidの付いたテキストボックス要素に文字を入力するたびに、
        フィールド内の文字列をコンソールに出力します。
        ここでのCを「イベントリスナー」と呼びます。




#### 処理の流れ

![](data_flow_before.png)

* まず`XMLHttpRequest`によりCSVテキストデータを取得します。
    取得したデータは`CSVtoTable`により2次元テーブルデータに変換されて`table`に格納され、
    続いて`filter()`により`tableFiltered`が更新されます（データ取得直後はなにもフィルタの条件がないので`table`と同じデータになります）。
    `slice()`で`itemsPerPage`と`pageNumber`の値に基づいて表示する行を切り出したデータを作り`tableSliced`に格納します。
    最後に`renderAll()`によりDOMの書き換えを行い、`tableSliced`等が表示されます。
* 各テキストボックスは`addEventListener`により監視されており、文字が入力されるとそれぞれ登録されている処理が実行されます。
    例えばテキストボックス`first-name`に文字を入力すると、
    その値で`inputFirstName`を更新し、
    `filter()`, `slice()`, `renderAll()`
    という3つの処理が順番に行われます。
* テキストボックス`items-per-page`に文字を入力すると
    その値で`itemsPerPage`を更新し、
    `slice()`, `renderAll()`
    の2つの処理を実行します。
    `page-at`も同様です。


#### 追加すべき処理

* このままでは、テキストボックスに1文字入力するたびに`filter`が実行されるので、
    テーブルが巨大な場合負荷が大きくなってしまいます。
    短時間に`filter`が繰り返されるのを避けるために
    各イベントの発火頻度を抑える工夫をしなければなりません。
* `itemsPerPage`や`tableFiltered`が変更されたとき、
    存在しないページを選択したままになってしまう場合がありうるので、
    `pageNumber`を`1`にリセットするのが適切です。


#### 修正版

![](data_flow_after.png)


#### 不満点

注目してほしいのは、
各イベントリスナー（`event => { /* 処理 */ }`の部分）では、テキストボックスの値が変わったときに必要な処理をすべて書いていないといけないことです。
`inputFirstName`の値が変わったときには
`filter()`, `slice()`, `renderAll()`
の3つの処理が必要で、しかもこの順番でなければなりません。
`itemsPerPage`の値が変わったときには
`filter()`は不要で、
`slice()`, `renderAll()`のみが必要となります。
このように、値が変わったときに依存している変数の書き換え等を注意深く記述しなければなりません。

今回のデモでは同時に1つのテキストボックスへの入力しか行われないため処理は比較的単純ですが、
例えば複数の端末からの入力を通信するような場合だと、変数の依存関係に注意しながら正確に処理させるのは途端に難しくなると思われます。

RxJSのようなリアクティブプログラミングをサポートするライブラリを使うと、
このような変数同士の依存関係の問題をうまく解決することができます。


### RxJSを使った場合の実装 (DataTableAppByRxJS)

次にRxJSを使った場合を説明します。
違いはJavaScript部分で、htmlとcssの部分に変更はありません。

RxJSの機能のうち今回使っているのは、
"Observable"と呼ばれるクラスと、それを作るための関数の一つである`fromEvent`、
既に作られたObservableに処理を施したObservableを作る
オペレータ
`map`, `startWith`, `debounceTime`、
そして複数のObservableを組わせたObservableを作る関数`combineLatest`です。
