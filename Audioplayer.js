
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
        this.addSongField = document.getElementById('addSongField');
        this.redactInput = document.getElementById('redactSongNameInput');
        this.redactSongNameBtn = document.getElementById('redactSongNameBtn');
        this.modalOverlay = document.querySelector('.modal-overlay');
        this.redactingSongId = null;

        // console.log(this.settings);
        //this.checkErrors();
        this.generatePlaylist(this.getFirstArrFromPlaylist());

        // попытка создать свое событие:
        var event = new Event('build');
        // Подписываемся на событие
        document.addEventListener('build', function (e) { console.log('builded') }, false);
        // Вызываем событие
        document.dispatchEvent(event);

        this.initialization();
    }

    initialization (){
        this.playBtn.addEventListener('click', this.startPlay);
        this.stopBtn.addEventListener('click', this.stopPlay);

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

    }

    addEventsToArrOfElems(select, event, funcName){
        let Arr = this.playlistContainer.querySelectorAll(select);
        if(Arr.length > 0){
            for(let i=0; i < Arr.length; i++){
                Arr[i].addEventListener(event, funcName);
            }
        }
    }

    playlistInfo = (e) => {
        e.stopPropagation();
        let list = e.target.closest('.list');
        let listName = list.dataset.playlistItem;
        this.deletePlaylist(listName);
    };

    deletePlaylist(playlistName){
        delete  this.settings.playlist[playlistName];
        this.reloadPlaylists();
        // проверка на то открыт ли текущий плейлист, если да, то очистить его
        if (playlistName === this.getShownPlaylistName() ){
            this.playlistContainer.innerHTML = '';
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
            let str = '<p> В плейлисте нет песен </p>';
            this.playlistContainer.innerHTML = str;
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

    generatePlaylist(arr){
        let playlist = '';
        for (let i = 0; i < arr.length; i++){
            let elemName = arr[i].name;
            let fullTime = arr[i].fullTime;
            let string = `<div class="song hover-base" data-song-id="${i}"> ${elemName} 
                            <div class='actions'>
                            
                                <div class="img-container edit">
                                    <img class="edit" src="img/edit-tools.svg" alt="" title="Редактировать">
                                </div>
                                <div class="img-container delete">
                                    <img class="delete" src="img/send-to-trash.svg" alt="" title="Удалить">
                                </div>
                                
                            </div> 
                            <span class="song-time"> ${fullTime} </span>
                          </div>`;
            playlist += string;
        }
        this.addPlaylistToPage(playlist);

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
        delete this.getPlaylistByName(playlistName)[songId];
        // после удаления объекта из массива фильтрую массив на отброс пустых элементов
        this.settings.playlist[playlistName] = this.getPlaylistByName(playlistName).filter(element => element !== null);

        if(reloadPlaylist === 'reload' || reloadPlaylist === true){
            this.reloadShownPlaylist();
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
        let playlist = this.settings.playlist[playlistName];
        playlist[songId].name = songName;
        if(reloadPlaylist === 'reload' || reloadPlaylist === true){
            this.reloadShownPlaylist();
        }
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

    changeSrcInAudioElem (playlist, songId) {

        let playlistName = this.getShownPlaylistName();

        this.song.src = this.settings.playlist[playlistName][songId].src; // как называется использвание 2х [] скобок?
        this.song.load();
        this.startPlay();

    }

    nextSong = () =>{

        let playlistName = this.getShownPlaylistName();

        if( this.id < this.settings.playlist[playlistName].length - 1 ){
            this.song.pause();
            this.input.value = 0;
            this.id++;
            this.changeSrcInAudioElem(this.settings.playlist[playlistName], this.id);
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
            // this.countTime();
            // this.restartTimer();
            // this.getSongName();
            // this.song.play();
        }
        if(this.timer === false){
            // this.timeReduction();
        }

    };

    changePlaylist = (e) => {
        let data = e.target.parentElement.dataset.playlistItem;
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

    /* --------------------------------------------- */

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
        let songName = songNameInput.value;
        let songSrc = songSrcInput.value;
        if(songName === ''){
            songName = songSrc.split('.')[0];
        }
        if( songSrc !== '' ){
            this.addNewSongToPlaylist(songSrc, this.getShownPlaylistName(), songName, true);
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
        let playingSongs = document.querySelectorAll('.playing');
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

        this.checkSongCondition();
        this.song.currentTime = this.input.value;

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

    generatePlaylists(){
        // В этой функции генерирутся и вставляются в разметку блоки с плейлистами
        let playlistsContainer = document.querySelector('.playlists');
        let playlistsNamesArr = Object.keys(this.settings.playlist);
        // этот элемент - плюс для добавления нового плейлиста
        playlistsContainer.innerHTML = `<div class="openNewPlaylistField hover-rgba" id="openNewPlaylistField">
                    <img class="img-relative" src="img/plus.svg" alt="">
                </div>`;

        let playlistElem = '';

        for( let i = 0; i < playlistsNamesArr.length; i++ ){
            playlistElem = `
                <div class='list' data-playlist-item=${playlistsNamesArr[i]}>
                    <img src='img/playlist1.png' class='responsive' title='${playlistsNamesArr[i]}' alt='playlist icon'>
                    <span class="delete-playlist-icon js-deletePlaylist">
                        <img class="delete-icon" src="img/plus.svg" alt="">
                    </span>
                </div>`;

            playlistsContainer.innerHTML += playlistElem;
        }

        // Добавление событий на иконки удаления плейлстов
        let Arr = document.querySelectorAll('.js-deletePlaylist');
        if(Arr.length > 0){
            for(let i=0; i < Arr.length; i++){
                Arr[i].addEventListener('click', this.playlistInfo);
            }
        }

    }

    // New universal methods:

    addNewSongToPlaylist = (songSrc, playlistName, songName, reloadPlaylist) => {
        let newSongObj = {src: songSrc, name: songName};

        if( playlistName !== '' && songSrc !== ''){

            // console.log(this.getPlaylistByName(playlistName));

            // добавление параметров песни в массив с плейлистом
            this.getPlaylistByName(playlistName).push(newSongObj);

            if(reloadPlaylist === 'reload' || reloadPlaylist === true){
                this.reloadShownPlaylist();
            }

        }
        else {
            alert('что-то не заполненно');
        }
    };

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

        default: [
            {
                src: 'music/halogen-u-got-that.mp3',
                name: 'Halogen u got that',
                img: '',
                author: '',
                fullTime: '03:07'
            },
            {
                src: 'music/TutTutChild_HotPursuit.mp3',
                name: 'TutTutChild HotPursuit',
                img: '',
                author: '',
                fullTime: '04:58'
            },
            {
                src: 'music/ac-dc-i-love-rock-and-roll.mp3',
                name: 'AC/DC I love rock and roll',
                img: '',
                author: '',
                fullTime: '02:55'
            },
            {
                src: 'music/tones-and-i-dance-monkey.mp3',
                name: 'Tones and i dance monkey',
                img: '',
                author: '',
                fullTime: '03:29'
            }
        ],

        custom : [
            {
                src: 'music/bee_gees_-_staing_alive_(zf.fm).mp3',
                name: 'Bee Gees - Staying Alive',
                img: '',
                author: '',
                fullTime: '04:38'
            },
            {
                src: 'music/hrj.mp3',
                name: 'Ray Charles - Hit the road jack',
                img: '',
                author: '',
                fullTime: '01:52'
            },
            {
                src: 'music/ljapis_trubeckoj_-_kapital_(zvukoff.ru).mp3',
                name: 'Ляпис Трубецкой - Капитал',
                img: '',
                author: '',
                fullTime: '03:20'
            },
        ]

    },
    buttonsSwitches: true,
    startBtnId: 'playNew',
    stopBtnId: 'stopNew',
    nextBtnId: 'nextNew',
    prevBtnId: 'prevNew',
});

// нужна проверка на наличие вводимого плейлиста
//Au.addNewSongToPlaylist('music/ljapis_trubeckoj_-_kapital_(zvukoff.ru).mp3', 'default', 'New song');
// + проверка на наналичие id песни
//Au.deleteSongFromPlaylist('default', 2, true);

//Au.addNewPlaylist('mySongs', true);
//Au.addNewSongToPlaylist('music/ljapis_trubeckoj_-_kapital_(zvukoff.ru).mp3', 'mySongs', 'New song');

//Au.deletePlaylist('default');

//Au.saveNewSongName('default', 'AC/DC', 2, true);