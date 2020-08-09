let templates = {
    // song: `<div class="song hover-base" data-song-id="{i}">
    //                         <div class="d-flex align-items-center">
    //                             <div class="song-img-container"><img src="{img}" alt=""></div>
    //                             {elemName} 
    //                         </div>
                            
    //                         <div class='actions'>
                            
    //                             <div class="img-container edit">
    //                                 <img class="edit" src="img/edit-tools.svg" alt="" title="Редактировать">
    //                             </div>
    //                             <div class="img-container delete">
    //                                 <img class="delete" src="img/send-to-trash.svg" alt="" title="Удалить">
    //                             </div>
                                
    //                         </div> 
    //                         <span class="song-time"> {fullTime} </span>
    //                       </div>`,
    // playlist: `
    //             <div class='list' data-playlist-item={playlistsNamesArr[i]}>
    //                 <img src='img/playlist1.png' class='responsive' title='{playlistsNamesArr[i]}' alt='playlist icon'>
    //                 <span class="delete-playlist-icon js-deletePlaylist">
    //                     <img class="delete-icon" src="img/plus.svg" alt="">
    //                 </span>
    //             </div>`,
    addPlaylist: `
                    <div class="openNewPlaylistField hover-rgba" id="openNewPlaylistField">
                        <img class="img-relative" src="img/plus.svg" alt="">
                    </div>`,
    song: `<li class="song" data-song-id="{i}"> {elemName} </li>`,
    playlist: `
                <div class='album' data-playlist-item='{playlistsNamesArr[i]}' title='{playlistsNamesArr[i]}'>
                    <img class='img-relative' src='img/albums-logos/playlist1.png' >
                    <p class='album-name--small'>
                        Album name {playlistsNamesArr[i]}
                    </p>
                </div>`,
};