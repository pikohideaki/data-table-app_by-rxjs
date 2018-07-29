/**
 * tableApp RxJS版
 */
document.getElementById('title').innerText = 'Data table app by RxJS';


const { Observable,
        fromEvent,
        combineLatest,
        merge
      } = rxjs;

const { map,
        startWith,
        debounceTime,
        withLatestFrom,
      } = rxjs.operators;



// CSVテキストデータ
const csvString$ = (() => {
    const req = new XMLHttpRequest();
    const url = 'https://dl.dropboxusercontent.com/s/d76vdmr3jafwg3j/testdata.csv';
    req.open('get', url);  // リクエストを初期化
    req.send();  // リクエストの送信
    return fromEvent( req, 'load' )  // 'load'イベントからObservableを作成
      .pipe( map( event => event.target.responseText ) );  // 取得したデータからのcsvTextの取り出し
  })();

// テーブルデータ
const table$ = csvString$.pipe( map( CSVtoTable ) );  // csv文字列を2次元テーブルに変換


// 「名前」の列のテキストフィールドの値
const fullName$
  = fromEvent( document.getElementById('full-name'), 'input' )
      .pipe( map( event => event.target.value ),
             debounceTime(300),
             startWith('') );

// 「Eメールアドレス」の列のテキストフィールドの値
const emailAddress$
  = fromEvent( document.getElementById('email-address'), 'input' )
      .pipe( map( event => event.target.value ),
             debounceTime(300),
             startWith('') );

// 「性別」の列のテキストフィールドの値
const gender$
  = fromEvent( document.getElementById('gender'), 'input' )
      .pipe( map( event => event.target.value ),
             debounceTime(300),
             startWith('') );


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
  = fromEvent( document.getElementById('items-per-page'), 'input' )
      .pipe( map( event => event.target.valueAsNumber ),
             map( val => (val || 50) ),
             debounceTime(300),
             startWith(50) );

// ページ数
const pageLength$ = combineLatest(
      tableFiltered$,
      itemsPerPage$,
      (table, itemsPerPage) => Math.ceil( table.length / itemsPerPage ) )
    .pipe( startWith(1) );

// 現在のページ番号
const pageNumber$ = merge(
    fromEvent( document.getElementById('page-number'), 'input' )
      .pipe( map( event => event.target.valueAsNumber ),
             map( val => (val || 1) ),
             debounceTime(300) ),
    pageLength$.pipe( map( _ => 1 ) )
  ).pipe( startWith(1) );


// tableFilteredのurlち現在のページに表示する部分
const tableSliced$ = combineLatest(
      itemsPerPage$,
      pageNumber$ )
    .pipe(
      withLatestFrom( tableFiltered$ ),
      map( ([[itemsPerPage, pageNumber], tableFiltered]) =>
          tableFiltered.slice(
              itemsPerPage * (pageNumber - 1),
              itemsPerPage * pageNumber ) )
    );



{ // subscriptions
  // テーブルを表示
  tableSliced$.subscribe( tableSliced => {
    printTable( document.getElementById('data-table'), tableSliced );
  });

  // フィルタ後の行数を表示
  tableFiltered$.subscribe( tableFiltered => {
    document.getElementById('nof-items').innerText = tableFiltered.length;
  });

  // ページ数を表示
  pageLength$.subscribe( pageLength => {
    document.getElementById('page-number').setAttribute('max', pageLength);
    document.getElementById('page-length').innerText = (pageLength || 1);
  });

  // ページ番号を指定するテキストボックスの値を更新
  pageNumber$.subscribe( pageNumber => {
    document.getElementById('page-number').valueAsNumber = (pageNumber || 1);
  });
}

  // 1ページあたりの表示行数を指定するテキストボックスの値を初期化
document.getElementById('items-per-page').valueAsNumber = 50;
