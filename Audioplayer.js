
class Audioplayer {
    constructor(params) {
        const options = params || {};
        this.settings = {
            playlist: options.playlist,
            buttonsSwitches: options.buttonsSwitches || false,
            startBtnId: options.startBtnId || 'play',
            stopBtnId: options.stopBtnId || 'stop',
            nextBtnId: options.nextBtnId || 'next',
            prevBtnId: options.prevBtnId || 'prev',
        };
        this.playBtn = document.getElementById(this.settings.startBtnId);
        this.stopBtn = document.getElementById(this.settings.stopBtnId);

        if(this.settings.buttonsSwitches !== false){
            this.prevBtn = document.getElementById(this.settings.prevBtnId);
            this.nextBtn = document.getElementById(this.settings.nextBtnId);
        }

        this.input = document.querySelector('input[type="range"]');
        this.song = null;
        this.player = document.getElementById('audios');
        this.id = 0;
        this.timeElem = document.getElementById('timeleft');
        this.minutes = 0;
        this.seconds = 0;
        this.timer = null;
        this.playlistContainer = document.getElementById('playlist');
        this.playlistsList = null;
        this.playingPlaylist = Object.keys(this.settings.playlist)[0];
        this.redactInput = document.getElementById('redactSongNameInput');
        this.redactSongNameBtn = document.getElementById('redactSongNameBtn');
        this.modalOverlay = document.querySelector('.modal-overlay');
        this.preload = document.getElementById('preload');
        this.redactingSongId = null;
        this.buffer = {};
        //this.checkErrors();
        this.events = {};
        setTimeout(() => {
            this.generatePlaylist(this.getFirstArrFromPlaylist());
            this.initialization();
        }, 0);

    }

    on(evName, handler){
        this.events[evName] = new Event(evName);
        document.addEventListener(evName, handler, false);
    }

    async initialization (){

        // эта строка нужна), пусть пока будет
        // this.playBtn.addEventListener('click', this.startPlay);
        this.playBtn.addEventListener('click',  () => {
            if(this.playBtn.dataset.action === 'play'){
                this.song.play();
            }
            else {
                this.stopPlay();
            }
        });
        this.stopBtn.addEventListener('click', this.discharge);

        this.input.addEventListener('change', this.changeValue);
        this.input.addEventListener('input', this.chooseValue);

        /* Создание и присваивание нового трека переменной */
        this.createAudioElem();
        /*  Добавление трека */
        this.addAudioElem();
        /* Добавление плейлистов в колонку динамиески  */
        this.generatePlaylists();
        /* Создание списка новых элементов  */
        this.playlistsList = document.querySelectorAll('div[data-playlist-item]');

        if(this.settings.buttonsSwitches !== false){
            this.nextBtn.addEventListener('click', this.nextSong);
            this.prevBtn.addEventListener('click', this.prevSong);
        }
        else {
            let buttonsArr = document.querySelector('.buttons').querySelectorAll('.button');
            buttonsArr[0].remove();
            buttonsArr[buttonsArr.length - 1].remove();
        }

        if(this.playlistsList.length > 0){
            for(let i=0; i < this.playlistsList.length; i++){
                this.playlistsList[i].addEventListener('click', this.changePlaylist);
            }
        }

        let songList = document.querySelectorAll('div[data-song-id]');
        if(songList.length > 0){
            for(let i=0; i < songList.length; i++){
                songList[i].addEventListener('click', this.nextSongFromPlaylist);
                songList[i].addEventListener('click', this.highlightPlayingSong);
            }
        }

        this.song.setAttribute('data-id', this.id);

        document.getElementById('openAddingField').addEventListener('click', this.toggleAddingField);
        document.getElementById('addSongBtnClose').addEventListener('click', this.toggleAddingField);
        document.getElementById('addSongBtn').addEventListener('click', this.dataFromAddSongField);

        document.getElementById('openNewPlaylistField').addEventListener('click', this.toggleAddingPlaylistField);
        document.getElementById('addPlaylistBtnClose').addEventListener('click', this.toggleAddingPlaylistField);
        document.getElementById('addPlaylistBtn').addEventListener('click', this.dataFromAddPlaylistField);

        this.addEventsToArrOfElems('.delete', 'click', this.getSongIdAndStartDeleting);
        this.addEventsToArrOfElems('.edit', 'click', this.openEditingSongName);

        this.redactSongNameBtn.addEventListener('click', this.closeModalAndSaveNewSongName);

        this.song.addEventListener('pause',  () => {
            // clearInterval(this.timer);
            this.togglePlayPause();
        });

        this.song.addEventListener('play', this.newStartPlay);

        navigator.mediaSession.setActionHandler('previoustrack', () => {
            // User hit "Previous Track" key.
            this.prevSong();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
            // User hit "Next Track" key.
            this.nextSong();
        });
        // получаю название первого плейлиста и добавляю его к элементу playlistContainer
        this.playlistContainer.dataset.playlistName = this.getFirstPlaylistName();
        // выставление нужной картинки play или pause
        this.togglePlayPause();

    }
    // Сброс
    discharge = () => {
        this.song.pause();
        clearInterval(this.timer);
        this.timer = false;
        this.preload.textContent = '0 %';
        this.timeElem.textContent = '00:00';
        this.song.currentTime = 0;
        this.input.value = 0;
        let activeSong = document.querySelector('.song.playing');
        if(activeSong){
            activeSong.classList.remove('playing');
        }
        document.getElementById('song-duration').textContent = '00:00';
    };

    newStartPlay = () =>  {
        this.checkSongCondition();
        if(this.song.readyState > 0){
            this.countTime();
            this.newTimeReduction();
            this.input.max = parseInt(this.song.duration);
            // переклюение изображения стоп/запуск
            this.togglePlayPause();
            // подсветка текущего трека
            this.highlightPlayingSong(event, this.getCurrentPlayingSongDOMElem());
            this.getSongLoadedPercent();
        }
        this.song.onloadeddata = () =>{
            this.countTime();
            this.newTimeReduction();
            this.input.max = parseInt(this.song.duration);

            // в этом кусочке кода я вручную выставляю dataset, чтобы при включении песни
            // отображалась только картинка паузы
            this.playBtn.dataset.action = 'play';
            this.togglePlayPause();
            //------------------------------------

            // подсветка текущего трека
            this.highlightPlayingSong(event, this.getCurrentPlayingSongDOMElem());
            this.getSongLoadedPercent();
        }

    };

    getSongLoadedPercent = () =>{
        document.getElementById('track').addEventListener('timeupdate', () => {
            let duration =  this.song.duration;

            if (duration > 0) {
                // вывод процента подгрузки песни
                for (var i = 0; i < this.song.buffered.length; i++) {
                    if (this.song.buffered.start(this.song.buffered.length - 1 - i) < this.song.currentTime) {
                        // console.log( Math.round((this.song.buffered.end(this.song.buffered.length - 1 - i) / duration) * 100) + '%');
                        this.preload.textContent = Math.round((this.song.buffered.end(this.song.buffered.length - 1 - i) / duration) * 100) + '%';
                        break;
                    }
                }
            }
        });
    };

    togglePlayPause(){
        let shownIconArr = this.playBtn.querySelectorAll('.show');
        for(let i = 0; i < shownIconArr.length; i++){
            shownIconArr[i].classList.remove('show');
        }

        if(this.playBtn.dataset.action === "pause"){
            this.playBtn.querySelector('.play').classList.add('show');
            this.playBtn.dataset.action = 'play';
        }
        else {
            this.playBtn.querySelector('.pause').classList.add('show');
            this.playBtn.dataset.action = 'pause';
        }
    }

    getFirstPlaylistName(){
        // console.log(Object.keys(this.settings.playlist[0]) );
        return Object.keys(this.settings.playlist)[0];
    }

    addEventsToArrOfElems(select, event, funcName){
        let Arr = this.playlistContainer.querySelectorAll(select);
        if(Arr.length > 0){
            for(let i=0; i < Arr.length; i++){
                Arr[i].addEventListener(event, funcName);
            }
        }
    }

    async getTimeInMinutesAndSeconds(songSrc){

        let audio = new Audio(songSrc);
        // Дождаемся пока прогрузится песня и происходит
        // автоматический расчет длительности проигрывания песни и конвертация из секунд в минуты и секунды
        return await new Promise(function (resolve) {
            audio.onloadeddata = function () {
                let fullTime = parseInt(audio.duration, 10);
                let locMin = parseInt((fullTime / 60), 10);
                let locSec = fullTime - (locMin * 60);
                let localMinutes = '';
                if(locMin < 10){
                    localMinutes = '0' + locMin;
                }
                if(locSec < 10){
                    locSec = '0' + locSec;
                }
                // console.log(`${localMinutes}:${locSec}`);
                let result = `${localMinutes}:${locSec}`;
                resolve (result);
            }
        });

    }

    newGetTimeInMinutesAndSeconds(duration){

        // Дождаемся пока прогрузится песня и происходит
        // автоматический расчет длительности проигрывания песни и конвертация из секунд в минуты и секунды
        let fullTime = parseInt(duration, 10);
        let locMin = parseInt((fullTime / 60), 10);
        let locSec = fullTime - (locMin * 60);
        let localMinutes = '';
        if(locMin < 10){
            localMinutes = '0' + locMin;
        }
        if(locSec < 10){
            locSec = '0' + locSec;
        }
        // console.log(`${localMinutes}:${locSec}`);
        return `${localMinutes}:${locSec}`;

    }

    playlistInfo = (e) => {
        e.stopPropagation();
        let list = e.target.closest('.list');
        let listName = list.dataset.playlistItem;
        this.deletePlaylist(listName);
    };

    deletePlaylist(playlistName){
        if(this.checkingForAvailabilityPlaylist(playlistName)){
            delete  this.settings.playlist[playlistName];
            this.reloadPlaylists();
            // проверка на то открыт ли текущий плейлист, если да, то очистить его
            if (playlistName === this.getShownPlaylistName() ){
                this.playlistContainer.innerHTML = '<p class="text-center"> В плейлисте нет песен </p>';
            }
            // Event
            document.dispatchEvent(this.events['deletePlaylist']);
        }
    }

    addAudioElem(){
        this.player.appendChild(this.song).setAttribute('id', 'track');
    }

    createAudioElem(){

        let firstSong;
        let firstArr;
        for (var i in this.settings.playlist) {
            firstArr = this.settings.playlist[i];
            break;
        }

        if(firstArr === undefined){
            this.playlistContainer.innerHTML = '<p> В плейлисте нет песен </p>';
        }
        else {
            firstSong = firstArr[0].src;
            this.song = new Audio(firstSong);
        }
        //console.log(firstSong);
    }

    getFirstArrFromPlaylist(){
        for (var i in this.settings.playlist) {
            return this.settings.playlist[i];
        }
    }

    async generatePlaylist(arr){

        // Event
        document.dispatchEvent(this.events['beforePlaylistReload']);
        console.time('Playlistloaded');
        let playlist = '';
        for (let i = 0; i < arr.length; i++){
            let elemName = arr[i].name;
            let fullTime;
            // если песня есть в буфере, то берется ее длительность
            if (elemName in this.buffer){
                fullTime = this.buffer[elemName];
            }
            // в ином случае считается (при первой загрузке или при изменении имени песни)
            else {
                // let songTime = await this.getTimeInMinutesAndSeconds(arr[i].src);
                // let songTime = '00:00';
                let songTime = this.newGetTimeInMinutesAndSeconds(arr[i].duration);
                this.buffer[elemName] = songTime;
                fullTime = songTime;
            }

            let img;
            if(arr[i].img === '' ){
                img = 'img/no-image.png';
            }
            else {
                img = arr[i].img;
            }

            // закомененная строка - старый способ получения длительности
            // let fullTime = arr[i].fullTime;

            // подстановка переменных в шаблон
            let string = templates.song.replace('{i}', i).replace('{elemName}', elemName).replace('{fullTime}', fullTime).replace('{img}', img);

            playlist += string;
        }
        this.addPlaylistToPage(playlist);
        this.refreshEventListeners();

        // Event
        document.dispatchEvent(this.events['playlistReloaded']);
        console.timeEnd('Playlistloaded');
    }

    getShownPlaylist(){
        return this.settings.playlist[this.getShownPlaylistName()];
    }

    getPlaylistByName = (name) => {
        return this.settings.playlist[name];
    };

    getSongIdAndStartDeleting = (e) => {
        e.stopPropagation();
        let songId = e.target.closest('.song').dataset.songId;
        this.deleteSongFromPlaylist(this.getShownPlaylistName(), songId, true);
    };

    deleteSongFromPlaylist(playlistName, songId, reloadPlaylist ){

        let alertQuestion = confirm(`Вы действительно хотите удалить песню ${this.settings.playlist[playlistName][songId].name}`);

        if(alertQuestion){
            delete this.getPlaylistByName(playlistName)[songId];
            // после удаления объекта из массива фильтрую массив на отброс пустых элементов
            this.settings.playlist[playlistName] = this.getPlaylistByName(playlistName).filter(element => element !== null);

            if(reloadPlaylist === 'reload' || reloadPlaylist === true){
                this.reloadShownPlaylist();
            }
            // Event
            document.dispatchEvent(this.events['deleteSong']);
        }

    }

    openEditingSongName = (e) => {
        e.stopPropagation();
        this.redactingSongId = e.target.closest('.song').dataset.songId;
        this.redactInput.value = this.getShownPlaylist()[this.redactingSongId].name;
        this.modalOverlay.classList.add('d-flex');
    };

    closeModalAndSaveNewSongName = () => {

        this.saveNewSongName(this.getShownPlaylistName(), this.redactInput.value, this.redactingSongId, true);
        this.modalOverlay.classList.remove('d-flex');
    };

    saveNewSongName(playlistName , songName, songId, reloadPlaylist){

        // Event
        document.dispatchEvent(this.events['beforeSongNameChanged']);

        let playlist = this.settings.playlist[playlistName];
        playlist[songId].name = songName;
        if(reloadPlaylist === 'reload' || reloadPlaylist === true){
            this.reloadShownPlaylist();
        }
        // Event
        document.dispatchEvent(this.events['changeSongName']);
    }

    addPlaylistToPage (list) {
        this.playlistContainer.innerHTML = list;
    }

    startPlay = () => {

        if(this.song.paused ){
            //console.log('условие is paused');
            this.song.play();
            this.countTime();
            this.newTimeReduction();
            // this.getSongName();
            this.input.max = parseInt(this.song.duration);

            // подсветка текущего трека
            this.highlightPlayingSong(event, this.getCurrentPlayingSongDOMElem());

        }

        this.song.oncanplay = () => {
            //console.log('обычное условие');
            this.countTime();
            this.newTimeReduction();
            this.input.max = parseInt(this.song.duration);
            this.song.play();
        }


    };

    getCurrentPlayingSongDOMElem(){
        if( this.getShownPlaylistName() === this.playingPlaylist ){
            let songsArr = document.querySelector(`div[data-playlist-name=${this.playingPlaylist}]`).querySelectorAll(`div[data-song-id]`);
            return  songsArr[this.id];
        }
    }

    getShownPlaylistName(){
        return this.playlistContainer.dataset.playlistName;
    }

    async changeSrcInAudioElem (playlist, songId) {

        let playlistName = this.getShownPlaylistName();

        function getCache(request) {
            return caches.open('songs')
                .then(cache => cache.match(request));
        }

        function addSongToCache(request, response) {
            console.log('try to put song in cache');
            return caches.open('songs')
                .then(cache => cache.put(request, response));
        }

        function getNetworkRequest (request) {
            // Fetch network artwork.
            return fetch(request)
                .then(networkResponse => {
                    if (networkResponse.status !== 200) {
                        return Promise.reject('Network artwork response is not valid');
                    }
                    // Add artwork to the cache for later use and return network response.
                    addSongToCache(request, networkResponse.clone());
                    return networkResponse;
                })
                .catch(error => {
                    // Return cached fallback artwork.
                    console.log('get from cache');
                    return getCache(new Request(request))
                });
        }

        let data = undefined;
        // это условие позволяет не делать запрос, если песня запускается локально
        if( !(this.settings.playlist[playlistName][songId].src).includes('music/') ){
            data = await getNetworkRequest(this.settings.playlist[playlistName][songId].src);
        }

        // если песня пришла из кеша, то она вкладывается в аудио элемент, если нет - из хранилища
        if(data !== undefined){
            this.song.src = data.url;
        }
        else{
            this.song.src = this.settings.playlist[playlistName][songId].src; // как называется использвание 2х [] скобок?
        }
        this.song.load();
        this.song.play();

    }

    nextSong = () =>{

        let playlistName = this.getShownPlaylistName();

        if( this.id < this.settings.playlist[playlistName].length - 1 ){
            this.song.pause();
            this.input.value = 0;
            this.id++;
            this.changeSrcInAudioElem(this.settings.playlist[playlistName], this.id);
            this.song.currentTime = 0;
            this.highlightPlayingSong(event, this.getCurrentPlayingSongDOMElem());
        }

    };

    nextSongFromPlaylist = (e) => {

        let playlistName = this.getShownPlaylistName();

        let song = '';
        if(e.target.classList.contains('song')) song = e.target;
        else song = e.target.parentElement;
        let songId = song.dataset.songId;
        this.song.pause();
        // тут происходит обнуление переменной инпута, в следствии при пересчете в timeReduction обнуляются значения
        this.input.value = 0;
        //---------------------
        this.id = songId;
        this.togglePlayPause();
        this.changeSrcInAudioElem(this.settings.playlist[playlistName], songId);

        if(this.playingPlaylist != this.getShownPlaylistName()){
            this.changePlayingPlaylist();
        }


    };

    prevSong = () =>{

        if (this.id > 0){
            this.song.pause();
            this.input.value = 0;
            this.id--;
            let playlistName = this.getShownPlaylistName();
            this.changeSrcInAudioElem(this.settings.playlist[playlistName], this.id);
            this.song.currentTime = 0;
            this.input.max = this.song.duration;
        }

    };

    changePlaylist = (e) => {
        let data;
        if (e.target.classList.contains('list')){
            data = e.target.dataset.playlistItem;
        }
        else {
            data = e.target.parentElement.dataset.playlistItem;
        }
        this.generatePlaylist(this.settings.playlist[data]);
        document.getElementById('playlist').dataset.playlistName = data;
        this.refreshEventListeners();
        if (this.song.duration > 0 && !this.song.paused) {
            this.highlightPlayingSong(event, this.getCurrentPlayingSongDOMElem());
        }

    };

    refreshEventListeners(){
        // обновление прослушивателей на воспроизведение песни по нажатию на нее
        let songArr = document.getElementById('playlist').querySelectorAll('div[data-song-id]');
        for(let i = 0; i < songArr.length; i++){
            songArr[i].addEventListener('click', this.nextSongFromPlaylist);
        }
        // обновление прослушивателей на кнопку удалить
        this.addEventsToArrOfElems('.delete', 'click', this.getSongIdAndStartDeleting);
        // обновление прослушивателей на кнопку редактировать
        this.addEventsToArrOfElems('.edit', 'click', this.openEditingSongName);

    }

    stopPlay = () =>{
        this.song.pause();
        clearInterval(this.timer);
        this.timer = false;
    };

    countTime(){
        let fullTime = parseInt(this.song.duration, 10);
        let locMin = parseInt((fullTime / 60), 10);
        let locSec = fullTime - (locMin * 60);
        let localMinutes;
        if(locMin < 10){
            localMinutes = '0' + locMin;
        }
        if(locSec < 10){
            locSec = '0' + locSec;
        }
        let time = document.getElementById('song-duration');
        // при переклчении межу песнями выводило NaN значение. Код ниже это исправляет
        if(!this.song.duration) {
            //console.log('song is not loaded yet');
            time.textContent = '00:00';
        }
        else {
            time.textContent = (`${localMinutes}:${locSec}`);
        }
        //------------------------------------

    }

    dataFromAddPlaylistField = () => {
        let playlistNameInput = document.getElementById('newPlaylistName');
        let playlistName = playlistNameInput.value;

        if( playlistName !== ''){

            //this.settings.playlist[playlistName] = [];
            this.addNewPlaylist(playlistName, true);

            // Очистка интутов после добавления
            playlistNameInput.value = '';
        }
        else {
            alert('что-то не заполненно');
        }

    };

    addNewPlaylist(newPlaylistName, reloadPlaylists){
        this.settings.playlist[newPlaylistName] = [];
        if(reloadPlaylists === 'reload' || reloadPlaylists === true){
            this.reloadPlaylists();
        }
        // Event
        document.dispatchEvent(this.events['addPlaylist']);
    }

    reloadPlaylists(){
        this.generatePlaylists();
        this.refreshPlaylistsEventListeners();
    }

    refreshPlaylistsEventListeners(){
        document.getElementById('openNewPlaylistField').addEventListener('click', this.toggleAddingPlaylistField);
        let playlistsArr = document.querySelector('.playlists').querySelectorAll('div[data-playlist-item]');
        for(let i = 0; i < playlistsArr.length; i++){
            playlistsArr[i].addEventListener('click', this.changePlaylist);
        }
    }

    toggleAddingPlaylistField(){
        let window = document.getElementById('addPlaylistField');
        window.classList.toggle('open');
    }

    toggleAddingField(){
        let window = document.getElementById('addSongField');
        window.classList.toggle('open');
    }

    dataFromAddSongField = () => {
        let songNameInput = document.getElementById('newSongName');
        let songSrcInput = document.getElementById('newSongSrc');
        let songImgInput = document.getElementById('newSongImg');
        let songName = songNameInput.value;
        let songSrc = songSrcInput.value;
        let songImg = songImgInput.value;
        if(songName === ''){
            songName = songSrc.split('.')[0];
        }
        if( songSrc !== '' ){
            this.addNewSongToPlaylist(songSrc, this.getShownPlaylistName(), songName, songImg , true);
        }

    };

    changePlayingPlaylist(){
        // изменение игращего плейлиста
        this.playingPlaylist = this.playlistContainer.dataset.playlistName;
    }

    highlightPlayingSong = (event, song ) => {
        // очистка всех элементов с классом playing
        this.clearPlayingSongs();
        // добавление класса playing при условии, что нажали на песню
        if(song !== undefined && song.classList.contains('song')){
            song.classList.add('playing');
        }
        else {
            if(event.target.classList.contains('song')){
                event.target.classList.add('playing');
            }
        }

    };

    clearPlayingSongs(){
        // очистка всех элементов с классом playing
        let playingSongs = document.querySelectorAll('.song');
        for (let i = 0; i< playingSongs.length; i++){
            playingSongs[i].classList.remove('playing');
        }
    }

    checkSongCondition(){
        console.log('Состояние песни = ' + this.song.readyState);
    }

    checkErrors(){
        if(this.playBtn === null) console.log('play button not found. Check play button id');
        if(this.stopBtn === null) console.log('stop button not found. Check stop button id');
        if( this.settings.buttonsSwitches === true ){
            if(this.nextBtn === null) console.log('next button not found. Check button id');
            if(this.prevBtn === null) console.log('prev button not found. Check button id');
        }
        if( this.settings.buttonsSwitches === false ) console.log('Кнопки next и prev отключены');

        if(this.playlistsList.length === 0) console.log('Список плейлистов пуст или не найден');

    }

    setTime = () =>{
        if(this.song.ended){
            this.nextSong();
        }
    };

    chooseValue = () => {
      this.song.removeEventListener('timeupdate', this.setTime);
      clearInterval(this.timer);
    };

    changeValue = () =>{

        // this.checkSongCondition();
        this.song.currentTime = this.input.value;
        this.newTimeReduction();

    };

    newTimeReduction(){

        this.chooseValue();

        let shift = this.input.value;

        this.minutes = parseInt( ( shift / 60 ).toFixed(2));
        this.seconds = ( shift - (this.minutes * 60) );

        let strMin = '';
        let strSec = '';

        this.timer = setInterval(() =>{
            strMin = '';
            strSec = this.seconds;

            if(this.song.paused) clearInterval(this.timer);

            if(this.seconds > 59){
                this.minutes++;
                if( this.minutes < 10 ){
                    strMin = '0' + this.minutes;
                }
                else strMin = this.minutes;

                this.seconds = 0;
            }

            if(this.seconds < 10){
                strSec = '0' + this.seconds;
            }

            if( this.minutes < 10 ){
                strMin = '0' + this.minutes;
            }

            // console.log(strMin + " " + strSec);
            this.timeElem.textContent = (`${strMin}:${strSec}`);

            if(this.song.ended ){
                console.log('finished playing');
                clearInterval(this.timer);
                this.nextSong();
            }

            this.seconds++;
            this.input.value = this.song.currentTime;

        },1000);

    }

    getSongName(){
        let playlistName = this.getShownPlaylistName();
        let elem = document.getElementById('trackName');
        elem.textContent = this.settings.playlist[playlistName][this.id].name;
    }

    generatePlaylists () {

        // Event
        document.dispatchEvent(this.events['beforePlaylistsReload']);

        // В этой функции генерирутся и вставляются в разметку блоки с плейлистами
        let playlistsContainer = document.querySelector('.playlists');
        let playlistsNamesArr = Object.keys(this.settings.playlist);
        // этот элемент - плюс для добавления нового плейлиста
        playlistsContainer.innerHTML = templates.addPlaylist;

        let playlistElem = '';

        for( let i = 0; i < playlistsNamesArr.length; i++ ){
            // подстановка переменных в шаблон плейлиста
            playlistElem = templates.playlist.replace('{playlistsNamesArr[i]}', playlistsNamesArr[i]).replace('{playlistsNamesArr[i]}', playlistsNamesArr[i]);

            playlistsContainer.innerHTML += playlistElem;
        }

        // Добавление событий на иконки удаления плейлстов
        let Arr = document.querySelectorAll('.js-deletePlaylist');
        if(Arr.length > 0){
            for(let i=0; i < Arr.length; i++){
                Arr[i].addEventListener('click', this.playlistInfo);
            }
        }

        // Event
        document.dispatchEvent(this.events['playlistsReloaded']);

    }

    // New universal methods:

    checkingForAvailabilityPlaylist(playlistName){
        let playlistNames = Object.keys(this.settings.playlist);
        if( !playlistNames.includes(playlistName) ){
            console.log(`Плейлист ${playlistName} не существует`);
            alert(`Плейлист ${playlistName} не существует`);
        }
        else {
            return true
        }
    }

    async addNewSongToPlaylist (songSrc, playlistName, songName, songImg, reloadPlaylist) {

        // Event
        document.dispatchEvent(this.events['beforeSongAdded']);

        if(this.checkingForAvailabilityPlaylist(playlistName)){
            let songDuration = await this.getSongDurationInMs(songSrc);
            let newSongObj = {src: songSrc, name: songName, img: songImg, duration: songDuration};

            if( playlistName !== '' && songSrc !== ''){

                // добавление параметров песни в массив с плейлистом
                this.getPlaylistByName(playlistName).push(newSongObj);

                if(reloadPlaylist === 'reload' || reloadPlaylist === true){
                    this.reloadShownPlaylist();
                }

            }
            else {
                alert('что-то не заполненно');
            }
            // Event
            document.dispatchEvent(this.events['addSongToPlaylist']);
        }
    };

    async getSongDurationInMs(songSrc){
        let audio = new Audio(songSrc);

        return await new Promise(function (resolve) {
            audio.onloadeddata = function () {
                resolve ( parseInt(audio.duration) );
            }
        });
    }

    reloadShownPlaylist(){
        //отрисовка плейлиста с новой песней
        this.generatePlaylist(this.getShownPlaylist());
        document.getElementById('playlist').dataset.playlistName = this.getShownPlaylistName();
        this.refreshEventListeners();
        this.highlightPlayingSong(event, this.getCurrentPlayingSongDOMElem());
    }
    
}

let Au = new Audioplayer({
    playlist: {

        online: [
            {
                src: 'https://dl3.ru-music.xn--41a.ws/mp3/4039.mp3',
                name: "Maruv Boosin",
                duration: 178,
                img: 'https://i3.ru-music.org/img/song/thumb/279-the-qemists-no-more.jpg',
            },
            {
                src: 'https://dl3.ru-music.xn--41a.ws/mp3/3402.mp3',
                name: "Armin Van Buuren",
                duration: 191,
                img: 'https://i3.ru-music.org/img/song/thumb/835-joe-ford-let-it-out.jpg',
            },
            {
                src: 'http://a1020.phobos.apple.com/us/r30/Music/4b/ae/15/mzm.sfmdtyty.aac.p.m4a',
                name: 'Short song',
                img: 'https://i3.ru-music.org/img/song/thumb/283-tokyo-prose-see-through-love-original-mix.jpg',
                author: '',
                duration: 170,
                fullDuration: '03:29'
            }
        ],

        default: [
            {
                src: 'music/halogen-u-got-that.mp3',
                name: 'Halogen u got that',
                img: 'https://i3.ru-music.org/img/song/thumb/3402-armin-van-buuren-shivers-ft-susana.jpg',
                author: '',
                duration: 187,
                fullDuration: '03:07'
            },
            {
                src: 'music/TutTutChild_HotPursuit.mp3',
                name: 'TutTutChild HotPursuit',
                img: '',
                author: '',
                duration: 150,
                fullDuration: '04:58'
            },
            {
                src: 'music/ac-dc-i-love-rock-and-roll.mp3',
                name: 'AC/DC I love rock and roll',
                img: '',
                author: '',
                duration: 150,
                fullDuration: '02:55'
            },
            {
                src: 'music/tones-and-i-dance-monkey.mp3',
                name: 'Tones and i dance monkey',
                img: '',
                author: '',
                duration: 150,
                fullDuration: '03:29'
            },
        ],

        custom : [
            {
                src: 'music/bee_gees_-_staing_alive_(zf.fm).mp3',
                name: 'Bee Gees - Staying Alive',
                img: '',
                author: '',
                duration: 150,
                fullDuration: '04:38'
            },
            {
                src: 'music/hrj.mp3',
                name: 'Ray Charles - Hit the road jack',
                img: '',
                author: '',
                duration: 150,
                fullDuration: '01:52'
            },
            {
                src: 'music/ljapis_trubeckoj_-_kapital_(zvukoff.ru).mp3',
                name: 'Ляпис Трубецкой - Капитал',
                img: '',
                author: '',
                duration: 150,
                fullDuration: '03:20'
            },
        ]

    },
    buttonsSwitches: true,
    startBtnId: 'playNew',
    stopBtnId: 'stopNew',
    nextBtnId: 'nextNew',
    prevBtnId: 'prevNew',
});

Au.on('addSongToPlaylist', function () {
    // console.log('добавили новую песню');
});
Au.on('deleteSong', function () {
    // console.log('удалили песню');
});
Au.on('changeSongName', function () {
    // console.log('изменили песню');
});
Au.on('addPlaylist', function () {
    // console.log('добавили плейлист');
});
Au.on('deletePlaylist', function () {
    // console.log('удалили плейлист');
});
Au.on('beforeSongAdded', function () {
    // console.log('перед добавлением песни');
});
Au.on('beforeSongNameChanged', function () {
    // console.log('перед изменением имени песни');
});
Au.on('beforePlaylistReload', function () {
    // console.log('перед переагрузкой плейлиста');
});
Au.on('playlistReloaded', function () {
    // console.log('после переагрузки плейлиста');
});
Au.on('beforePlaylistsReload', function () {
    // console.log('перед переагрузкой списка плейлистов');
});
Au.on('playlistsReloaded', function () {
    // console.log('после переагрузки списка плейлистов');
});

//Au.addNewSongToPlaylist('music/ljapis_trubeckoj_-_kapital_(zvukoff.ru).mp3', 'default', 'New song', '', true);
// + проверка на наналичие id песни
//Au.deleteSongFromPlaylist('default', 2, true);
//Au.addNewPlaylist('mySongs', true);
//Au.addNewSongToPlaylist('music/ljapis_trubeckoj_-_kapital_(zvukoff.ru).mp3', 'mySongs', 'New song', '');
//Au.deletePlaylist('default');
//Au.saveNewSongName('default', 'AC/DC', 2, true);