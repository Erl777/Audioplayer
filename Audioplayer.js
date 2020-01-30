
class Audioplayer {
    constructor(params) {
        const options = params || {};
        this.settings = {
            playlist: options.playlist
        };
        this.playBtn = document.getElementById('play');
        this.stopBtn = document.getElementById('stop');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.input = document.querySelector('input[type="range"]');
        this.song = new Audio(this.settings.playlist[0]);
        this.player = document.querySelector('.player');
        this.id = 0;
        this.playlist = null;
        this.once = false;
        this.timeElem = document.getElementById('timeleft');
        this.minutes = 0;
        this.seconds = 0;
        this.timer = null;
        this.initialization();
    }

    initialization (){
        this.playBtn.addEventListener('click', this.startPlay);
        this.stopBtn.addEventListener('click', this.stopPlay);

        this.input.addEventListener('change', this.changeValue);
        this.input.addEventListener('input', this.chooseValue);

        this.player.appendChild(this.song).setAttribute('id', 'track');

        this.nextBtn.addEventListener('click', this.nextSong);
        this.prevBtn.addEventListener('click', this.prevSong);

        this.song.setAttribute('data-id', this.id);
        this.addPlayList();
        this.addTimeUpdateEvent();
        this.getSongName();
    }

    addPlayList(){
        for (let i = 1; i < this.settings.playlist.length; i++){

            let elem = this.settings.playlist[i];
            let song =  new Audio(elem);
            this.player.appendChild(song).setAttribute('data-id', `${i}`);
        }
        this.playlist = document.querySelectorAll('[data-id]');
    }

    addTimeUpdateEvent(){
        for (let i = 0; i < this.settings.playlist.length; i++){
            this.playlist[i].addEventListener('timeupdate', this.setTime);
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
        if(this.song.ended && this.id === this.playlist.length) clearInterval(this.timer);
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
            this.song = this.playlist[this.id];
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

        if (this.id < (this.playlist.length - 1)){
            this.song.pause();
            this.input.value = 0;
            this.id++;
            this.song = this.playlist[this.id];
            this.song.currentTime = 0;
            this.input.max = this.song.duration;
            this.countTime();
            this.getSongName();
            this.song.play();
        }

        if(this.song.ended && this.id === (this.playlist.length - 1)){
            clearInterval(this.timer);
            this.timer = false;
        }

    };

    getSongName(){
        let elem = document.getElementById('trackName');
        let b = this.song.src.substr(this.song.src.lastIndexOf('/')+1);
        elem.textContent = b.split('.')[0];
    }

}

new Audioplayer({
    playlist: ['music/halogen-u-got-that.mp3','music/TutTutChild_HotPursuit.mp3',
        'music/ac-dc-i-love-rock-and-roll.mp3',
        'music/tones-and-i-dance-monkey.mp3']
});
