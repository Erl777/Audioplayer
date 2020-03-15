
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
        this.song = new Audio(this.settings.playlist[0].src);
        this.player = document.querySelector('.player');
        this.id = 0;
        this.audiolist = null;
        this.once = false;
        this.timeElem = document.getElementById('timeleft');
        this.minutes = 0;
        this.seconds = 0;
        this.timer = null;
        this.playlist = '';
        this.playlistsList = document.querySelectorAll('div[data-playlist-item]');
        this.customPlaylist = [
            {
                src: 'music/1111.mp3',
                name: '1111',
                img: '',
                author: '',
                fullTime: '03:07'
            },
            {
                src: 'music/2222.mp3',
                name: '2222',
                img: '',
                author: '',
                fullTime: '04:58'
            },
            {
                src: 'music/3333.mp3',
                name: '3333',
                img: '',
                author: '',
                fullTime: '02:55'
            },
            {
                src: 'music/4444.mp3',
                name: '4444',
                img: '',
                author: '',
                fullTime: '03:29'
            }
        ];

        console.log(this.settings);
        this.checkErrors();
        this.generatePlaylist(this.settings.playlist);

        this.initialization();
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

    generatePlaylist(playlist){
        for (let i = 0; i < playlist.length; i++){
            let elemName = playlist[i].name;
            let fullTime = playlist[i].fullTime;
            let string = `<li class="song" data-song-id="${i}"> ${elemName} <span> ${fullTime} </span></li>`;
            this.playlist += string;
        }
        this.addPlaylistToPage(this.playlist);
        this.playlist = '';
    }

    addPlaylistToPage(list){
        let playlistContainer = document.getElementById('playlist');
        playlistContainer.innerHTML = list;

    }

    changePlaylist = (e) => {
        let data = e.target.parentElement.dataset.playlistItem;
        //console.log(e.target.parentElement);
        //console.log(data);
        if(data === 'default') this.generatePlaylist(this.settings.playlist);
        if(data !== 'default') this.generatePlaylist(this.customPlaylist);
        document.getElementById('playlist').dataset.playlistName = data;
        this.refreshEventListeners();
    };

    refreshEventListeners(){
        let songArr = document.getElementById('playlist').querySelectorAll('li[data-song-id]');
        //console.log(songArr);
        for(let i = 0; i < songArr.length; i++){
            songArr[i].addEventListener('click', this.nextSongFromPlaylist);
        }
    }

    initialization (){
        this.playBtn.addEventListener('click', this.startPlay);
        this.stopBtn.addEventListener('click', this.stopPlay);

        this.input.addEventListener('change', this.changeValue);
        this.input.addEventListener('input', this.chooseValue);

        this.player.appendChild(this.song).setAttribute('id', 'track');

        if(this.settings.buttonsSwitches !== false){
            this.nextBtn.addEventListener('click', this.nextSong);
            this.prevBtn.addEventListener('click', this.prevSong);
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
        this.addPlayList();
        this.addTimeUpdateEvent();
        this.getSongName();
    }

    addPlayList(){
        for (let i = 1; i < this.settings.playlist.length; i++){

            let elem = this.settings.playlist[i].src;
            // console.log(elem);
            let song =  new Audio(elem);
            this.player.appendChild(song).setAttribute('data-id', `${i}`);
        }
        this.audiolist = document.querySelectorAll('[data-id]');
    }

    addTimeUpdateEvent(){
        for (let i = 0; i < this.settings.playlist.length; i++){
            this.audiolist[i].addEventListener('timeupdate', this.setTime);
        }
    }

    startPlay = () => {
        if(this.once === false){
            this.input.max = document.getElementById('track').duration;
            this.once = true;
            this.countTime();
            this.timeReduction();
        }
        if(this.timer === false){
            this.timeReduction();
        }

        this.song.play();
        //console.log(this.audiolist);
    };

    stopPlay = () =>{
        this.song.pause();
        clearInterval(this.timer);
        this.timer = false;
    };

    setTime = () =>{
        this.input.value = parseInt(this.song.currentTime, 10);
        if(this.song.ended){
            this.nextSong();
        }
        if(this.song.ended && this.id === this.audiolist.length) clearInterval(this.timer);
    };

    timeReduction(){
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

    countTime(){
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
        let time = document.getElementById('timeleft');
        time.textContent = (`${localMinutes}:${this.seconds}`);
    }

    chooseValue = () => {
      this.song.removeEventListener('timeupdate', this.setTime);
      clearInterval(this.timer);
    };

    changeValue = () =>{
        this.song.currentTime = this.input.value;
        this.timeReduction();
        this.song.addEventListener('timeupdate', this.setTime);
    };

    prevSong = () =>{

        if (this.id > 0){
            this.song.pause();
            this.input.value = 0;
            this.id--;
            this.song = this.audiolist[this.id];
            this.song.currentTime = 0;
            this.input.max = this.song.duration;
            this.countTime();
            this.getSongName();
            this.song.play();
        }
        if(this.timer === false){
            this.timeReduction();
        }

    };

    nextSong = () =>{
        if (this.id < (this.audiolist.length - 1)){
            this.song.pause();
            this.input.value = 0;
            this.id++;
            this.song = this.audiolist[this.id];
            this.song.currentTime = 0;
            this.input.max = this.song.duration;
            this.countTime();
            this.getSongName();
            this.song.play();
        }

        if(this.song.ended && this.id === (this.audiolist.length - 1)){
            clearInterval(this.timer);
            this.timer = false;
        }
    };

    nextSongFromPlaylist = (e) => {
        //console.log(e.target);
        let song = '';
        if(e.target.classList.contains('song')) song = e.target;
        else song = e.target.parentElement;
        let songId = song.dataset.songId;
        //console.log(songId);
        //console.log(song);
        let curAudio = document.querySelector('.player.controls').querySelectorAll('audio');
        //console.log(curAudio);
        for(let i = 0; i < curAudio.length; i++){
            curAudio[i].remove();
        }
        let playListName = document.getElementById('playlist').dataset.playlistName;
        console.log(playListName);

        if(playListName === 'default') this.generateAudioElems(this.settings.playlist, songId);
        if(playListName !== 'default') this.generateAudioElems(this.customPlaylist, songId);

    };

    generateAudioElems(playlist, id){
        for (let i = 0; i < playlist.length; i++){
            let src = playlist[i].src;
            //let fullTime = playlist[i].fullTime;
            let coincidence = 'track';
            let string = '';
            if (id == i) {
                console.log(123);
                string = `<audio id="${coincidence}" src="${src}" data-id="${i}"></audio>`;
            }
            else {
                string = `<audio src="${src}" data-id="${i}"></audio>`;
            }
            this.playlist += string;
        }
        document.querySelector('.player.controls').innerHTML += this.playlist;
        //this.addPlaylistToPage(this.playlist);
        this.playlist = '';
    }

    getSongName(){
        let elem = document.getElementById('trackName');
        let b = this.song.src.substr(this.song.src.lastIndexOf('/')+1);
        elem.textContent = b.split('.')[0];
    }

}

new Audioplayer({
    playlist: [
            {
                src: 'music/halogen-u-got-that.mp3',
                name: 'halogen u got that',
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
                name: 'tones and i dance monkey',
                img: '',
                author: '',
                fullTime: '03:29'
            }
        ],
    buttonsSwitches: true,
    startBtnId: 'playNew',
    stopBtnId: 'stopNew',
    nextBtnId: 'nextNew',
    prevBtnId: 'prevNew',
});
