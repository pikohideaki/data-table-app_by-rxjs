# RxJSの紹介

## RxJSとは

* **R**eactive E**x**tension for **J**ava**S**cript  
  リアクティブプログラミング用のJavaScriptのライブラリ


## この記事について

本記事は、リアクティブプログラミングを知らない人向けに、
RxJSなどのリアクティブプログラミング用ライブラリを用いるメリットを、
実例を通して具体的に紹介することが目的です。
RxJSの内部実装には触れません。

JavaScriptをある程度書いたことがある人を想定しています。

RxJSを利用することには以下のような利点があります
（ここでは、それがどう良いのか分からないというものがあっても大丈夫です）。

* 複数のイベントを含む非同期処理を効率よく実装できる
* ある変数の値を更新するときに依存している変数の値の更新を芋づる式に行わせることができる
* 相互依存性の低いプログラムになる
* データの加工が直感的に行える
* ロジックと表示処理を分離できる

これらを理解するために、次節で説明するデータテーブルアプリケーションを実装します。



キーワード：
RxJS, Observable, JavaScript, リアクティブプログラミング


## Data Table App

今回は例として、以下のリンク先のような
ページネーションとフィルタ機能の付いたデータテーブルを実装します。

[data-table-app](https://codepen.io/pikohideaki/full/LrLzLX/)



## 実装


### RxJSの手軽な導入方法

1. index.html に以下の1行を追加

```html
<script src="https://unpkg.com/rxjs/bundles/rxjs.umd.min.js"></script>
```

2. JavaScriptのソースコード内で以下のように必要なものをimportする

```js
const { Observable, fromEvent, combineLatest, merge } = rxjs;
const { map, startWith, debounceTime, withLatestFrom } = rxjs.operators;
```


### 入力データ

CSVファイルの中身（一部）

```txt
1,Helaina Cunnell,hcunnell0@va.gov,Female
2,Wenda Teacy,wteacy1@4shared.com,Female
3,Fidelia Clayworth,fclayworth2@biblegateway.com,Female
4,Carlynne Duesbury,cduesbury3@nba.com,Female
5,Burton Bricknall,bbricknall4@altervista.org,Male
6,Liana Hearnden,lhearnden5@google.ca,Female

...

```

データテーブルの仕様

* テーブルデータはCSVファイル 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv' をhttpリクエストで取得したものとする
    * 内容は「名前」「Eメールアドレス」「性別」の3列からなるテーブルデータ
* リアルタイムフィルタリング機能：
    「名前」「Eメールアドレス」「性別」の各列に対し、リアルタイムなフィルタリングができる（各列の一番上の行のテキストボックスに文字列を入力すると、即座にその文字列を含む行のみに絞って表示する）
* ページネーション機能：
    * ページ番号を指定すると該当する範囲のデータのみ表示する
    * 1ページあたりの表示行数を指定できる（デフォルトは50行）
* その他
    * フィルタや表示行数変更により全ページ数が変わったときには選択ページ番号を1にリセットする
    （例えば1ページ100行表示・8ページ目を選択中に
    1ページ100行表示→200行表示と変更すると、
    全ページ数は5となり
    選択ページ番号が8のままだと存在しないページを選択したままになってしまう）



### JavaScriptの構文についての補足

今回使用している構文の一部について簡単な使い方を示します。

* `let`や`const`は変数宣言キーワード。`const`で宣言した変数は後で再代入できない
* `x => x * x`や`() => { /*処理*/ }`は関数定義。
* 配列クラスメソッド
    * `map`：渡した関数で変換した配列を返す。
        例）`[1,2,3].map( x => x * x )`の結果は`[1,4,9]`
    * `filter`：渡した判定関数で真となる要素のみからなる配列を返す。
        例）`[1,2,3,4,5].filter( x => x % 2 === 1 )`の結果は`[1,3,5]`
    * `every`：配列の全要素が条件を満たすか判定する。
        例）`[1,3,5,7].every( x => x % 2 === 1 )`の結果は`true`
    * `slice`：配列の切り出し。
        例）`[1,2,3,4,5].slice(1,3)`の結果は`[2,3]`、
            `[1,2,3,4,5].slice(2,4)`の結果は`[3,4]`
    * `join`：配列の文字列化。
        例）`[2018,7,27].join('-')`の結果は`"2018-7-27"`
* 文字列クラスメソッド
    * `split`：文字列の分割と配列化。
        例）`"aaa,bbb,ccc".split(',')`の結果は`["aaa","bbb","ccc"]`
    * `replace`：正規表現にマッチする部分を置換。
        例）`"aaabbb".replace(/ab/,'cc')`の結果は`"aaccbb"`
    * `indexOf`：部分文字列が最初に現れるインデックスを返す。存在しなければ`-1`を返す。
        例）`abcdef.indexOf('cd')`の結果は`2`、
            `abcdef.indexOf('g')`の結果は`-1`。

* その他
    * `setTimeout`・`clearTimeout`：処理を予約・解除する
        例）`const timerId = setTimeout( alert('aaa'), 3000 )`とすると'aaa'というメッセージのアラートが3秒後に表示される．
        その後3秒以内に`clearTimeout(timerId)`とすると，このアラート表示処理の予約を解除する．
    * `Math.ceil`：天井関数。整数に切り上げた値を返す。
        例）`Math.ceil(2.4)`は`3`







```js
const req = new XMLHttpRequest();
const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';
req.open('get', url);  // リクエストを初期化
req.send();  // リクエストの送信
const csvText$ = fromEvent( req, 'load' )  // 'load'イベントからObservableを作成
                    .pipe( map( event => event.target.responseText ),
                           startWith('') );
```




## RxJS使用するメリット

今回実装したアプリケーションについて
RxJSを使用した場合とそうでない場合を比較すると、
RxJSについて以下のようなメリットが挙げられます。

* グローバル変数への再代入が無い
    * ［RxJS不使用］再代入可能なグローバル変数を使っているのでその値が予測しづらい。
    * ［RxJS使用］RxJSではObservableでデータを表すので、
        その値の定義は変数の宣言＆定義部分で完結している。変数の値が予測しやすい。
* 変数とそれに対する処理の依存関係の記述が楽
    * ［RxJS不使用］ある変数の値が書き換わるとき、
        同時に書き換えなければならない変数やその書き換え実行順序を
        逐一すべて把握していなければならない。
    * ［RxJS使用］変数はそもそも依存している別のObservableやイベントにより定義された
        Observableなので、先の問題は起こらない。
        依存している変数の値の更新は自動的に芋づる式に行われるので、
        処理の依存関係・実行順序の心配がほとんど無い。
* ロジックと表示処理の記述を分離できる
    * ［RxJS不使用］変数の更新と表示処理を同時に行うためにそこにまとめて記述する必要があり、
        ソースコードが整理しづらい。
        表示処理がJavaScriptソースコード全体に散らばっているため、
        HTMLソースコードを変えた時の修正が大変。
    * ［RxJS使用］表示処理部分がまとまって記述されるので、
        読みやすくなる＆HTMLソースコード変更時のJavaScriptソースコードの修正が楽
* パイプ処理を使って直感的にデータの加工が行える
    *  RxJS不使用］300ms以内の連続入力による
    sliceの複数回実行を抑制する処理（`setTimeout`や`clearTimeout`を使った部分）
    がとても読みづらいコードになっていた
    * ［RxJS使用］`pipe`メソッドで`decounceTime(300)`を挟むだけでよい。


