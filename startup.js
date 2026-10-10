// Стартовые настройки игры: страна выбрана, версия/флаги выставлены — вводные окна (выбор страны, SMS/сервер,
// проверка обновлений) пропускаются. Вопрос «Включить звук?» подтверждается автоматически (ДА).
// Чтобы вернуть оригинальную последовательность окон, уберите <script src="startup.js"> из index.html
// и очистите localStorage сайта.
(function(){
  const RT=window.RT;
  RT.seedRMS={"aow212": ["I7xu4QAAAAAEAP////8AAAIAAAAA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAAAAAAAAAAAAAAAAAAADuyzD2AACBDhxJlMaXj1VDkQnYyFfEGUIVUIxbW4/YwhJFmAtXg1jCXQUVBhfPV4JWSdSCTpvEjlxJVcZUz1VPEQvWxBuP2AJRRZqG0MMZhggRCYoawpmCEkWZi1eDWAJdBRUGF89XgtZJ1IJOm8SOXAmUhlfAFcAAAAAAARk"]};
  let done=false;
  RT.beforeFrame=function(){
    if(done)return false;
    const c=RT.current,m=c&&c["m:Le;"];if(!m)return false;
    const s=m["aM:I"];
    if(s===27){done=true;RT.key(true,-6);setTimeout(function(){RT.key(false,-6)},80);return true}
    if(s===0)done=true;
    return false;
  };
})();
