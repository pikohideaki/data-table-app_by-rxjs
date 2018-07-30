/**
 * tableApp RxJS版
 */
document.getElementById('title').innerText = 'Data table app by RxJS';


const { Observable, fromEvent, combineLatest, merge } = rxjs;
const { map, startWith, debounceTime, withLatestFrom } = rxjs.operators;



// CSVテキストデータ
const csvString$ = (() => {
    const req = new XMLHttpRequest();
    req.open('get', url);  // リクエストを初期化
    req.send();  // リクエストの送信
    return fromEvent( req, 'load' )  // 'load'イベントからObservableを作成
      .pipe( map( event => event.target.responseText ) );  // 取得したデータからのcsvTextの取り出し
  })();


// テーブルデータ
const table$ = csvString$.pipe( map( CSVtoTable ) );


// 1ページに表示する列数
const itemsPerPage$
  = fromEvent( document.getElementById('items-per-page'), 'input' )
      .pipe( map( event => event.target.valueAsNumber ),  // テキストボックス内の値を数値として取出す
             map( val => (val || 50) ),
             debounceTime(300),
             startWith(50) );


// ページ数
const pageLength$
  = combineLatest(
        table$.map( table => table.length ),
        itemsPerPage$,
        getPageLength )
      .pipe( startWith(0) );


// ページ番号
const currentPage$
  = merge(
      fromEvent( document.getElementById('current-page'), 'input' )
        .pipe( map( event => event.target.valueAsNumber ),  // テキストボックス内の値を数値として取出す
               withLatestFrom( pageLength$ ),
               map( ([currentPage, pageLength]) =>
                 ( 1 <= currentPage && currentPage <= pageLength ? currentPage : 1) ),  // 範囲外のページを指定したときは1に修正する
               debounceTime(300)
        ),
      pageLength$.pipe( map( _ => 1 ) )
    ).pipe( startWith(1) );


// 表示するページの範囲
const range$
  = combineLatest( itemsPerPage$, currentPage$,
      (itemsPerPage, currentPage) => getRange(itemsPerPage, currentPage) );


// tableの表示するページ部分
const tableSliced$
  = range$.pipe( withLatestFrom( table$ ),
      map( ([range, table]) => table.slice( range.begin, range.end ) ) );


// 表示処理
{
  // ページ数を表示
  pageLength$.subscribe( pageLength => {
    document.getElementById('page-length').innerText = (pageLength || 0);
    document.getElementById('current-page').setAttribute('max', (pageLength || 1));
  });

  // ページ番号を指定するテキストボックスの値を更新
  currentPage$.subscribe( currentPage => {
    document.getElementById('current-page').valueAsNumber = (currentPage || 1);
  });

  // テーブルを表示
  tableSliced$.subscribe( tableSliced => {
    printTable( tableSliced );
  });

  range$.pipe( withLatestFrom( table$ ) ).subscribe( ([range, table]) => {
    document.getElementById('range').innerText
      = `(${range.begin + 1}-${range.end}) of ${table.length} items`;
  })
}
