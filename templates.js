let templates = {
    song: `<div class="song hover-base" data-song-id="{i}"> {elemName} 
                            <div class='actions'>
                            
                                <div class="img-container edit">
                                    <img class="edit" src="img/edit-tools.svg" alt="" title="Редактировать">
                                </div>
                                <div class="img-container delete">
                                    <img class="delete" src="img/send-to-trash.svg" alt="" title="Удалить">
                                </div>
                                
                            </div> 
                            <span class="song-time"> {fullTime} </span>
                          </div>`,
    playlist: `
                <div class='list' data-playlist-item={playlistsNamesArr[i]}>
                    <img src='img/playlist1.png' class='responsive' title='{playlistsNamesArr[i]}' alt='playlist icon'>
                    <span class="delete-playlist-icon js-deletePlaylist">
                        <img class="delete-icon" src="img/plus.svg" alt="">
                    </span>
                </div>`,
    addPlaylist: `
                    <div class="openNewPlaylistField hover-rgba" id="openNewPlaylistField">
                        <img class="img-relative" src="img/plus.svg" alt="">
                    </div>`
};