<?php

namespace App\LeafPlayer\Models;

use Illuminate\Auth\Authenticatable;
use Laravel\Lumen\Auth\Authorizable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Tymon\JWTAuth\Contracts\JWTSubject;

/**
 * This class represents an authenticateable LeafPlayer User.
 *
 * Class User
 * @package App\LeafPlayer\Models
 */
class User extends Media implements JWTSubject, AuthenticatableContract, AuthorizableContract {
    use Authenticatable, Authorizable;

    protected $fillable = ['id', 'name', 'password'];

    protected $visible = ['id', 'name', 'roles'];

    protected $appends = ['type', 'playlist_count'];

    public $incrementing = false;

    public function getJWTIdentifier() {
        return $this->getKey();
    }

    public function getJWTCustomClaims() {
        return [];
    }

    /**
     * Relation to the Playlists of the User.
     *
     * @return mixed
     */
    public function playlists() {
        return $this->hasMany(Playlist::class, 'owner_id')->orderBy('updated_at', 'DESC');
    }

    /**
     * Relationship to the roles of this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles() {
        return $this->belongsToMany(Role::class, 'users_roles');
    }

    /**
     * Relationship to all of this user's favorite songs.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoriteSongs() {
        return $this->morphedByMany(Song::class, 'favoritable');
    }

    /**
     * Relationship to all of this user's favorite albums.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoriteAlbums() {
        return $this->morphedByMany(Album::class, 'favoritable');
    }

    /**
     * Relationship to all of this user's favorite artists.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoriteArtists() {
        return $this->morphedByMany(Artist::class, 'favoritable');
    }

    /**
     * Relationship to all of this user's favorite playlists.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function favoritePlaylists() {
        return $this->morphedByMany(Playlist::class, 'favoritable');
    }

    /**
     * Test if user has a specific role.
     *
     * @param $name
     * @return bool
     */
    public function hasRole($name) {
        foreach($this->roles as $role) {
            if ($role->name == $name) {
                return true;
            }
        }

        return false;
    }

    /**
     * Test if user has a specific permission.
     *
     * @param $name
     * @return bool
     */
    public function hasPermission($name) {
        foreach ($this->roles as $role) {
            if ($role->hasPermission($name)) {
                return true;
            }
        }  
        
        return false;
    }

    /**
     * Generate a type attribute on the model.
     *
     * @return string
     */
    public function getTypeAttribute() {
        return 'user';
    }

    /**
     * Generate the playlist_count attribute.
     *
     * @return integer
     */
    public function getPlaylistCountAttribute() {
        return $this->playlists_count;
    }
}

