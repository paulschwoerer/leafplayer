<?php

class DotEnvEditor {
    private $env;

    public function __construct() {
        $this->env = base_path('.env');
    }

    public function changeEnv($data = []) {
        $env = $this->envToArray();

        foreach($data as $dataKey => $dataValue){
            foreach($env as $envKey => $envValue){
                if($dataKey === $envKey){
                    $env[$envKey] = $dataValue;
                }
            }
        }

        $this->save($env);
    }

    public function keyExists($key) {
        $env = $this->envToArray();

        foreach ($env as $envkey => $envvalue){
            if ($key === $envkey){
                return true;
            }
        }
        return false;
    }

    public function getValue($key) {
        if ($this->keyExists($key)){
            return env($key);
        } else {
            throw new Exception;
        }
    }

    public function envToArray() {
        $fileContents = file_get_contents($this->env);
        $fileContents = preg_split('/\n+/', $fileContents);

        $envValues = [];

        foreach ($fileContents as $char){
            if (preg_match('/^(#\s)/', $char) === 1) {
                continue;
            }

            $entry = explode('=', $char, 2);
            $envValues[$entry[0]] = isset($entry[1]) ? $entry[1] : null;
        }

        return array_filter($envValues, function($key) {
            return !empty($key);
        }, ARRAY_FILTER_USE_KEY);
    }

    public function save($data) {
        $contents = array();
        $i = 0;

        foreach ($data as $key => $value){
            if (preg_match('/\s/', $value) > 0 && (strpos($value, '"') > 0 && strpos($value, '"', -0) > 0)) {
                $value = '"' . $value . '"';
            }

            $contents[$i] = $key . "=" . $value;
            $i++;
        }

        $contents = implode("\n", $contents);
        file_put_contents($this->env, $contents);
    }
}