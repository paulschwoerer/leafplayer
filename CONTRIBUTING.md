# Contributing

### Prerequisites
Well first of all, you need a computer.

Make sure you have the following software installed on said computer:
- [Virtualbox](https://www.virtualbox.org/) (VMWare or Parallels will work as well, have a look at Homesteads [setup guide](https://laravel.com/docs/master/homestead))
- [Vagrant](https://www.vagrantup.com/)
- [Composer](https://getcomposer.org/) with PHP > 5.6
- [NodeJS](https://nodejs.org/en/)
- [NPM](https://www.npmjs.com/) (usually ships with NodeJS)

Obviously you need Git to clone the LeafPlayer repository into a directory of your choice.

### Setting up the backend
The backend is best run on [Laravel Homestead](https://laravel.com/docs/master/homestead). Of course you can use any other local webserver and/or database server, to get going fast however I urge you to use Homestead. It's pretty easy to set up and only has a few prerequisites mentioned in the section above.  
After installing the required software, it's merely a question of completing the following two steps.

- **Editing your `hosts` file:**  

    Your hosts file location depends on your operating system. For windows it's usually `C:\Windows\system32\drivers\etc\hosts`, for unix based systems `/etc/hosts`. You need to add the following entry to the bottom of the file:
    ```
    192.168.10.42  leafplayer.dev
    ```

- **Running the following commands from the `backend` directory:**

    ```bash
    $ composer update

    $ vagrant up
    ```

### Setting up the frontend

The frontend is based on the [VueJS webpack template](https://github.com/vuejs-templates/webpack). So getting it running is merely a question of running the following commands from the `frontend` directory:

    ```bash
    $ npm install

    $ npm run dev
    ```

### Daily usage

You can place test music into the `testmusic` directory. It will be accessible in homstead via `/home/vagrant/leafplayer-testmusic`

You can also ssh into vagrant to execute commands with `vagrant ssh`

### Issues

If you're having any issues with the setup process, give me a message.
