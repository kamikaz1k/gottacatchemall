// Pokemon Encounter

module.exports.encounter = function encounter(pokemon_id, pokemon_name, latitude, longitude, datetime, trainer_level) {
    this.pokemon_id = pokemon_id;
    this.pokemon_name = pokemon_name; 
    this.latitude = latitude; 
    this.longitude = longitude; 
    this.loc = { type: "Point", coordinates: [ parseFloat(longitude), parseFloat(latitude) ] };
    this.datetime = datetime; 
    this.trainer_level = trainer_level;
}