// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements,renderLoader,clearLoader} from './views/base';
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipe
 */
const state = {};   
/** 
 * Search Controller
 */
const controlSearch =async ()=>{
    // 1 get query from the view
    const query = searchView.getInput();
    //   const query = 'pizza';
    //console.log(query);
    if(query){
        // 2 new Search object
        state.search = new Search(query);
        // 3 Prepare UI for the results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        try{
        // 4 Search for recipes
        await state.search.getResults();
        //5 render result on UI
        clearLoader();
        searchView.renderResults(state.search.result);
        //console.log(state.search.result);
      //  console.log('Hello');
        }catch(err){
            alert('Something wrong with the search.... ')
            clearLoader();
        }
    }
};

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});

// test
// window.addEventListener('load', e =>{
//     e.preventDefault();
//     controlSearch();
// });

elements.searchResPages.addEventListener('click',e=>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto,10);
        searchView.clearResults();
        searchView.renderResults(state.search.result,goToPage);
    }
});

/** 
 * Recipe Controller
 */
 
 const controlRecipe = async () => {
     // get id from url
     const id = window.location.hash.replace('#','');
    //  console.log(id);

     if(id){
        // prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        // create new recipe object
        state.recipe = new Recipe(id);

        // test
        //window.r = state.recipe;
        try {
        // get recipe data and parse ingredients
        await state.recipe.getRecipe();
      // console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();    
        // calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();

        // render recipe
        //console.log(state.recipe);
        clearLoader();
        recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
        );

        } catch(err){
            console.log(err);
            alert('Error processing recipe!!!!')
        }
     }  
 }

//  window.addEventListener('hashchange',controlRecipe);
//  window.addEventListener('load',controlRecipe);
 ['hashchange','load'].forEach(event=>window.addEventListener(event,controlRecipe));

 /** 
 * List Controller
 */

 const controlList = ()=>{
    // create a new list if there in none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the lIST and UI
    state.recipe.ingredients.forEach(el=>{
        const item = state.list.addItem(el.count,el.unit,el.ingredient);
        listView.renderItem(item);
    });
 };

//  handle delete and update list item events
elements.shopping.addEventListener('click',e => {
    const id =  e.target.closest('.shopping__item').dataset.itemid;
    // handle delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //delete from the state
        state.list.deleteItem(id);
        // delete from ui
        listView.deleItem(id);
    }else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value);
        state.list.updateCount(id,val);
    }
});

/** 
 * Like Controller
 */
// testing 

 const controlLike = () => {
     if(!state.likes) state.likes = new Likes();
     const currentID = state.recipe.id;

     // user has NOT yet liked current recipe
     if(!state.likes.isLiked(currentID)){
         // add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
         // toggle the like button
        likesView.toggleLikeBtn(true);
         // add like to UI list
        likesView.renderLike(newLike);
         console.log(state.likes);
    // user has  yet liked current recipe
     }else{
         // remove like to the state
        state.likes.deleteLike(currentID);
         // toggle the like button
         likesView.toggleLikeBtn(false);
         // remove like to UI list
         likesView.deleteLike(currentID);
         console.log(state.likes);
     }
     likesView.toggleLikeMenu(state.likes.getNumLikes());
 };

 // restore liked recipes on page load
 window.addEventListener('load',() => {
    state.likes = new Likes();
    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());
    
    // render
    state.likes.likes.forEach(like => likesView.renderLike(like));
 });

 // handling recipe button clicks
 elements.recipe.addEventListener('click',e =>{
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase button is clicked

        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // add ingredient to shopping list
         controlList();
    } else if(e.target.matches('.recipe__love, .recipe__love *')){
        // Like controller
        controlLike();
    }
   // console.log(state.recipe);
 });

