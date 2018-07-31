class Movies {
    constructor() {
        this.api_key = '34040066e6feb3d52b20a96fa31440af';
        this.loader = document.getElementById("loading");
        this.searchEle = document.getElementById('search');
        this.resultWrapper = document.getElementById("results-wrapper");
        this.favStorage = localStorage.getItem('favStorage') ? JSON.parse(localStorage.getItem('favStorage')) : {results:[]};
    }
  
    toggleLoader() {
        this.loader.classList.toggle("show");
    }

    toggleInputError(flag) {
        if(flag) {
            this.searchEle.classList.add("is-invalid");
        } else {
            this.searchEle.classList.remove("is-invalid");
        }
    }

    findMovies() {
        let searchText = this.searchEle.value;
        this.toggleLoader();
        if (!searchText) {
            this.toggleInputError(true);
            this.toggleLoader();
            return false;
        }
        this.toggleInputError();

        this.fetchMovies(searchText);
    }

    fetchMovies(searchText) {
        let xhr = new XMLHttpRequest(),
            self = this;

        xhr.open('get', "https://api.themoviedb.org/3/search/movie?api_key=" + this.api_key + "&include_adult=false&query=" + searchText, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var data = JSON.parse(xhr.responseText);

                    if (data && data.results && data.results.length == 0) {
                        self.noResults();
                    } else {
                        self.listMovies(data);
                    }
                }
                if (xhr.status == 404) {
                    alert('ERROR');
                }
            }
        }
        xhr.send();
    }

    listMovies(data, favTrue) {
        let h2 = document.createElement("div");
        let self = this;
        h2.innerHTML = "Search > Movie Results";
        this.resultWrapper.innerHTML = "";
        this.resultWrapper.append(h2);

        for (let i = 0; i < data.results.length; i++) {

            let resultList = document.createElement("div");

            resultList.innerHTML = `
                <div class="results">
                    <div class="poster">
                        <img src="https://image.tmdb.org/t/p/w185_and_h278_bestv2/${data.results[i].poster_path}" />
                        <a id="fav_${data.results[i].id}" class="fa fa-heart-o"></a>
                    </div>
                    <div class="info">
                        <div class="polularity"><div style="width:${data.results[i].vote_average * 10 + '%'}"></div></div>
                        <h4>${data.results[i].title}</h4>
                        <span>${data.results[i].release_date}</span>
                        <p>${data.results[i].overview.substring(0,400)}...</p>
                    </div>
                </div>
            `;

            this.resultWrapper.appendChild(resultList);

            let fav = document.getElementById('fav_'+data.results[i].id);

            if (favTrue) {
                fav.classList.remove("fa-heart-o");
                fav.classList.add("fa-heart");
            }

            fav.addEventListener('click', function(event) {

                let ml = new MoviesList();

                let evtTarget = event.target;
                let id = evtTarget.getAttribute('id').substring(4, evtTarget.getAttribute('id').length);

                fav.classList.remove("fa-heart-o");
                fav.classList.add("fa-heart");

                var favObj = data.results.find(function (obj) { 
                    return obj.id == id; 
                });

                let e = true;

                if (self.favStorage.results.length > 0){
                    self.favStorage.results.map( item => {

                        if (item.id == id){
                            e = false;
                        }
                    })
                    if (e) {

                        self.favStorage.results.push(favObj);
                    } 
                } else {
                    self.favStorage.results.push(favObj);
                }

                ml.addFavMovies(JSON.stringify(self.favStorage));
            });
        }
        this.toggleLoader();
    }

    noResults() {
        let h2 = document.createElement("div");
        this.resultWrapper.innerHTML = "";
        h2.innerHTML = "Search > No Results found";
        this.resultWrapper.append(h2);
        this.toggleLoader();
    }
}

class MoviesList {
    addFavMovies(favStorage) {
        localStorage.setItem('favStorage', favStorage);
    }
}

(function(){
    let form = document.getElementsByTagName('form')[0];
    let favLink = document.getElementById('fav-link');
    let favData = localStorage.getItem('favStorage');
    let m = new Movies();

    if (favData) {
        m.toggleLoader();
        m.listMovies(JSON.parse(favData),true);
    } 

    favLink.addEventListener('click', function() {
        let favData = localStorage.getItem('favStorage');
        m.toggleLoader();
        m.listMovies(JSON.parse(favData), true);
    });

    form.addEventListener('submit', function() {
        m.findMovies();
    });
}());