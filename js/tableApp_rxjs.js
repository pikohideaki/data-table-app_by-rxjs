/**
 * tableApp RxJS版
 */
document.getElementById('title').innerText = 'Data table app by RxJS';


const { Observable, fromEvent, combineLatest, merge } = rxjs;
const { map, startWith, debounceTime, withLatestFrom } = rxjs.operators;




// 「名前」の列のテキストフィールドの値
const fullName$
  = fromEvent( $fullName, 'input' )
      .pipe( map( event => (event.target.value || '') ),
             debounceTime(300),
             startWith('') );

// 「Eメールアドレス」の列のテキストフィールドの値
const emailAddress$
  = fromEvent( $emailAddress, 'input' )
      .pipe( map( event => (event.target.value || '') ),
             debounceTime(300),
             startWith('') );

// 「性別」の列のテキストフィールドの値
const gender$
  = fromEvent( $gender, 'input' )
      .pipe( map( event => (event.target.value || '') ),
             debounceTime(300),
             startWith('') );



// CSVテキストデータ
const csvString$ = (() => {
    const req = new XMLHttpRequest();
    req.open('get', url);  // リクエストを初期化
    req.send();  // リクエストの送信
    return fromEvent( req, 'load' )  // 'load'イベントからObservableを作成
      .pipe( map( event => (event.target.responseText || '') ) );  // 取得したデータからのcsvTextの取り出し
  })();


// テーブルデータ
const table$ = csvString$.pipe( map( CSVtoTable ) );


// フィルタ後のテーブルデータ
const tableFiltered$ = combineLatest(
    table$,
    fullName$,
    emailAddress$,
    gender$,
    (table, fullName, emailAddress, gender) =>
      table.filter( line => filterFn( line, fullName, emailAddress, gender ) ) );



// 1ページに表示する列数
const itemsPerPage$
  = fromEvent( $itemsPerPage, 'input' )
      .pipe( map( event => (event.target.valueAsNumber || 50) ),  // テキストボックス内の値を数値として取出す
             debounceTime(300),
             startWith(50) );


// ページ数
const pageLength$
  = combineLatest(
        tableFiltered$.pipe( map( tableFiltered => tableFiltered.length ) ),
        itemsPerPage$,
        getPageLength )
      .pipe( startWith(0) );


// ページ番号
const currentPage$
  = merge(
      fromEvent( $currentPage, 'input' )
        .pipe( map( event => (event.target.valueAsNumber || 1) ),  // テキストボックス内の値を数値として取出す
               withLatestFrom( pageLength$ ),
               map( ([currentPage, pageLength]) =>
                 ( 1 <= currentPage && currentPage <= pageLength ? currentPage : 1) ),  // 範囲外のページを指定したときは1に修正する
               debounceTime(300)
        ),
      pageLength$.pipe( map( _ => 1 ) )  // pageLengthが変わったときはcurrentPageを1に
    ).pipe( startWith(1) );


// 表示するページの範囲
const range$
  = combineLatest( itemsPerPage$, currentPage$,
      (itemsPerPage, currentPage) => getRange(itemsPerPage, currentPage) );


// tableの表示するページ部分
const tableSliced$
  = range$.pipe(
        withLatestFrom( tableFiltered$ ),
        map( ([range, tableFiltered]) =>
              tableFiltered.slice( range.begin, range.end ) )
      );


// 表示処理
{
  // ページ数を表示
  pageLength$.subscribe( pageLength => {
    $pageLength.innerText = pageLength;
    $currentPage.setAttribute('max', pageLength);
  });

  // ページ番号を指定するテキストボックスの値を更新
  currentPage$.subscribe( currentPage => {
    $currentPage.valueAsNumber = currentPage;
  });

  // テーブルを表示
  tableSliced$.subscribe( tableSliced => {
    printTable( tableSliced );
  });

  range$.pipe( withLatestFrom( tableFiltered$ ) ).subscribe( ([range, tableFiltered]) => {
    $range.innerText = `(${range.begin + 1}-${range.end}) of ${tableFiltered.length} items`;
  })
}
