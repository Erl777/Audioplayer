
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
        }
        this.song.play();
    };

    stopPlay = () =>{
        this.song.pause();
    };

    setTime = () =>{
        this.input.value = parseInt(this.song.currentTime, 10);
        if(this.song.ended){
            this.nextSong();
        }
    };

    chooseValue = () => {
      this.song.removeEventListener('timeupdate', this.setTime);
    };

    changeValue = () =>{
        this.song.currentTime = this.input.value;
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
            this.song.play();
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
            this.song.play();
        }

    }

}

new Audioplayer({
    playlist: ['music/TutTutChild_HotPursuit.mp3',
        'music/ac-dc-i-love-rock-and-roll(mp3-top.info).mp3',
        'music/tones-and-i-dance-monkey(mp3-top.info).mp3']
});
