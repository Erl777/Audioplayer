
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

        // console.log(this.settings);
        //this.checkErrors();
        this.generatePlaylist(this.getFirstArrFromPlaylist());

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

        let songList = document.querySelectorAll('li[data-song-id]');
        if(songList.length > 0){
            for(let i=0; i < songList.length; i++){
                songList[i].addEventListener('click', this.nextSongFromPlaylist);
            }
        }

        this.song.setAttribute('data-id', this.id);



    }

    addAudioElem(){
        //console.log(this.settings.playlist);
        this.player.appendChild(this.song).setAttribute('id', 'track');
    }

    createAudioElem(){

        //console.log(this.settings.playlist);
        let firstSong;
        let firstArr;
        for (var i in this.settings.playlist) {
            firstArr = this.settings.playlist[i];
            break;
        }
        //console.log(firstArr);

        if(firstArr === undefined){
            let str = '<li> В плейлисте нет песен </li>';
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
        //console.log(arr);
        //let arr = this.getFirstArrFromPlaylist();
        let playlist = '';
        for (let i = 0; i < arr.length; i++){
            let elemName = arr[i].name;
            let fullTime = arr[i].fullTime;
            let string = `<li class="song" data-song-id="${i}"> ${elemName} <span> ${fullTime} </span></li>`;
            playlist += string;
        }
        this.addPlaylistToPage(playlist);

    }

    addPlaylistToPage (list) {
        this.playlistContainer.innerHTML = list;
    }

    startPlay = () => {

        if(this.song.paused ){
            console.log('условие is paused');
            this.song.play();
            this.countTime();
            this.newTimeReduction();
            this.getSongName();
            this.input.max = parseInt(this.song.duration);
        }

        this.song.oncanplay = () => {
            console.log('обычное условие');
            this.countTime();
            this.newTimeReduction();
            this.input.max = parseInt(this.song.duration);
            this.song.play();
        }


    };

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
    };

    refreshEventListeners(){
        let songArr = document.getElementById('playlist').querySelectorAll('li[data-song-id]');
        for(let i = 0; i < songArr.length; i++){
            songArr[i].addEventListener('click', this.nextSongFromPlaylist);
        }
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
            console.log('song is not loaded yet');
            time.textContent = '00:00';
        }
        else {
            time.textContent = (`${localMinutes}:${locSec}`);
        }
        //------------------------------------

    }

    /* --------------------------------------------- */

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
        // this.input.value = parseInt(this.song.currentTime, 10);
        if(this.song.ended){
            this.nextSong();
        }
        // if(this.song.ended && this.id === this.audiolist.length) clearInterval(this.timer);
    };

    chooseValue = () => {
      this.song.removeEventListener('timeupdate', this.setTime);
      //console.log('this.timer id = ' + this.timer);
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

    /* Готовые функциит(не требующие изменения и не вызыващие подозрений) */

    getSongName(){
        let playlistName = this.getShownPlaylistName();
        let elem = document.getElementById('trackName');
        elem.textContent = this.settings.playlist[playlistName][this.id].name;
    }

    /* Свежие */

    generatePlaylists(){
        let playlistsContainer = document.querySelector('.playlists');
        let playlistsNamesArr = Object.keys(this.settings.playlist);

        let playlistElem = '';

        for( let i = 0; i < playlistsNamesArr.length; i++ ){
            playlistElem = `
                <div class='list' data-playlist-item=${playlistsNamesArr[i]}>
                    <img src='img/playlist1.png' class='responsive' title='${playlistsNamesArr[i]}' alt='playlist icon'>
                </div>`;

            playlistsContainer.innerHTML += playlistElem;
        }


    }

}

new Audioplayer({
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
