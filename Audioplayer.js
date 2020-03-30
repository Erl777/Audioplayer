
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
        //this.audiolist = null;
        this.once = false;
        this.timeElem = document.getElementById('timeleft');
        this.minutes = 0;
        this.seconds = 0;
        this.timer = null;
        this.playlistContainer = document.getElementById('playlist');
        this.playlistsList = document.querySelectorAll('div[data-playlist-item]');

        // console.log(this.settings);
        //this.checkErrors();
        this.generatePlaylist(this.getFirstArrFromPlaylist());

        this.initialization();
    }

    initialization (){
        this.playBtn.addEventListener('click', this.startPlay);
        this.stopBtn.addEventListener('click', this.stopPlay);

        //this.input.addEventListener('change', this.changeValue);
        //this.input.addEventListener('input', this.chooseValue);

        /* Создание и присваивание нового трека переменной */
        this.createAudioElem();
        /*  Добавление трека */
        this.addAudioElem();

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
        //this.addPlayList();
        this.addTimeUpdateEvent();
        //this.getSongName();
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

    startPlay = (e) => {
        // e.preventDefault();
        // if(this.once === false){
        //
        //     this.once = true;
        //     this.countTime();
        //     this.timeReduction();
        // }
        // if(this.timer === false){
        //     this.timeReduction();
        // }

        this.countTime();
        this.timeReduction();
        this.input.max = parseInt(this.song.duration);
        this.song.play();

    };

    getShownPlaylistName(){
        return this.playlistContainer.dataset.playlistName;
    }

    changeSrcInAudioElem (playlist, songId) {

        let playlistName = this.getShownPlaylistName();
        // console.log(playlistName);
        // console.log(typeof playlistName);
        // console.log(this.settings.playlist[playlistName][songId]);
        this.song.src = this.settings.playlist[playlistName][songId].src; // как называется использвание 2х [] скобок?
        this.song.load();
        this.startPlay();

    }

    nextSong = () =>{

        // console.log(this.id);

        let playlistName = this.getShownPlaylistName();

        if( this.id < this.settings.playlist[playlistName].length - 1 ){
            this.song.pause();
            this.input.value = 0;
            this.id++;
            this.changeSrcInAudioElem(this.settings.playlist[playlistName], this.id);

            if(this.song.ended && this.id === (this.audiolist.length - 1)){
                clearInterval(this.timer);
                this.timer = false;
            }

        }


        // if (this.id < (this.audiolist.length - 1)){
        //     this.song.pause();
        //     this.input.value = 0;
        //     this.id++;
        //     this.song = this.audiolist[this.id];
        //     this.song.currentTime = 0;
        //     this.input.max = this.song.duration;
        //     this.countTime();
        //     this.restartTimer();
        //     this.getSongName();
        //     this.song.play();
        // }
        //
        // if(this.song.ended && this.id === (this.audiolist.length - 1)){
        //     clearInterval(this.timer);
        //     this.timer = false;
        // }
    };

    nextSongFromPlaylist = (e) => {

        // let playlistName = document.getElementById('playlist').dataset.playlistName;
        let playlistName = this.getShownPlaylistName();

        let song = '';
        if(e.target.classList.contains('song')) song = e.target;
        else song = e.target.parentElement;
        let songId = song.dataset.songId;
        this.song.pause();
        this.id = songId;

        this.changeSrcInAudioElem(this.settings.playlist[playlistName], songId);

        // let curAudio = document.querySelector('.player.controls').querySelectorAll('audio');
        // for(let i = 0; i < curAudio.length; i++){
        //     curAudio[i].remove();
        // }
        //
        // if(playlistName === 'default') this.generateAudioElems(this.settings.playlist, songId);
        // if(playlistName !== 'default') this.generateAudioElems(this.customPlaylist, songId);

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
        //console.log(data);
        // if(data === 'default') this.generatePlaylist(this.getFirstArrFromPlaylist());
        // if(data !== 'default') this.generatePlaylist(this.settings.playlist[data]);
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

    stopPlay = (e) =>{
        // e.preventDefault();
        this.song.pause();
        clearInterval(this.timer);
        this.timer = false;
    };

    /* --------------------------------------------- */

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
        time.textContent = (`${localMinutes}:${locSec}`);
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


    addTimeUpdateEvent(){
        for (let i = 0; i < this.settings.playlist.length; i++){
            this.audiolist[i].addEventListener('timeupdate', this.setTime);
        }
    }


    setTime = () =>{
        this.input.value = parseInt(this.song.currentTime, 10);
        if(this.song.ended){
            this.nextSong();
        }
        if(this.song.ended && this.id === this.audiolist.length) clearInterval(this.timer);
    };

    timeReduction(){
        let fullTime = parseInt(this.song.duration, 10);
        //let newTime = 0 + this.input.value;


        // console.log(this.minutes);
        // console.log(this.seconds);
        // console.log(this.song.currentTime);

        if(this.song.currentTime !== 0){
            // console.log('попал');
            if( (this.song.currentTime / 60) > 0) this.minutes = parseInt(this.song.currentTime / 60) ;
            if (this.song.currentTime > 60) this.seconds = fullTime - (this.minutes * 60 );
            else  this.seconds = this.song.currentTime;
        }
        else {
            this.minutes = 0;
            this.seconds = 0;
        }

        //this.minutes = parseInt((fullTime / 60), 10);
        //this.seconds = fullTime - (this.minutes * 60) + this.song.currentTime;

        //let localMinutes = parseInt((fullTime / 60), 10);
        //let localSeconds = fullTime - (this.minutes * 60) ;
        let strMin = '00';
        // console.log(this.minutes);

        this.timer = setInterval(() =>{

            this.seconds++;

            if(this.seconds > 59){
                this.minutes++;
                if( this.minutes < 10 ){
                    strMin = '0' + this.minutes;
                }
                else strMin = this.minutes;

                this.seconds = 0;
            }

            if(this.seconds < 10){
                this.seconds = '0' + this.seconds;
            }
            this.timeElem.textContent = (`${strMin}:${this.seconds}`);

            if(this.song.ended() ){
                console.log('finished playing');
                clearInterval(this.timer);
                this.nextSong();
            }

        },1000);

    }

    timeReductionRez(){
        let fullTime = parseInt(this.song.duration, 10);
        let newTime = fullTime - this.input.value;
        this.minutes = parseInt((newTime / 60), 10);
        this.seconds = newTime - (this.minutes * 60);
        let localMinutes;
        this.timer = setInterval(() =>{
            if(this.seconds < 1){
                this.minutes--;
                this.seconds = 60;
            }
            this.seconds--;

            if(this.minutes < 10){
                localMinutes = '0' + this.minutes;
            }
            if(this.seconds < 10){
                this.seconds = '0' + this.seconds;
            }
            this.timeElem.textContent = (`${localMinutes}:${this.seconds}`);
        },1000);

    }

    countTimeRez(){
        let fullTime = parseInt(this.song.duration, 10);
        this.minutes = parseInt((fullTime / 60), 10);
        this.seconds = fullTime - (this.minutes * 60);
        let localMinutes;
        if(this.minutes < 10){
            localMinutes = '0' + this.minutes;
        }
        if(this.seconds < 10){
            this.seconds = '0' + this.seconds;
        }
        let time = document.getElementById('song-duration');
        time.textContent = (`${localMinutes}:${this.seconds}`);
    }

    chooseValue = () => {
      this.song.removeEventListener('timeupdate', this.setTime);
      clearInterval(this.timer);
    };

    changeValue = () =>{
        this.song.currentTime = this.input.value;
        this.timeReduction();
        console.log(this.input.value);
        this.song.addEventListener('timeupdate', this.setTime);
    };

    restartTimer(){
        clearInterval(this.timer );
        this.timeReduction();
    }

    setNewTrackFromPlaylist(){
        this.song = document.getElementById('track');
    }

    startPlayFromPlaylist (){

        try {
            this.song.oncanplay = () => {
                if(this.once === true){
                    this.countTime();
                }
                this.startPlay();
                this.getSongName();
            };
        }
        catch (e) {
            console.log('не вышло');
            console.log(e);
        }

    }

    getSongName(){
        let songId = this.song.dataset.id;
        let playlistName = document.getElementById('playlist').dataset.playlistName;
        let elem = document.getElementById('trackName');

        if(playlistName == 'default'){
            elem.textContent = this.settings.playlist[songId].name;
        }
        else {
            elem.textContent = this.customPlaylist[songId].name;
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
