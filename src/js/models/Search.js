import axios from 'axios';

export default class Search{
    constructor(query){
        this.query =query;
    }

    async getResults(){
        //const proxy = 'https://cors-anywhere.herokuapp.com/';
        //const proxy ='https://crossorigin.me/';
        //const key = 'c551177f6amshe00a08242a19010p1f3b8djsn80e887a4d596';
        const res = await axios(`https://forkify-api.herokuapp.com/api/search?q=${this.query}`);
        this.result = res.data.recipes;
        //console.log(this.result);
    }
    
}
