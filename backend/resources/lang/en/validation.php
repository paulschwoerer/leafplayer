<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted'             => 'The attribute :attribute must be accepted.',
    'active_url'           => 'The attribute :attribute is not a valid URL.',
    'after'                => 'The attribute :attribute must be a date after :date.',
    'after_or_equal'       => 'The attribute :attribute must be a date after or equal to :date.',
    'alpha'                => 'The attribute :attribute may only contain letters.',
    'alpha_dash'           => 'The attribute :attribute may only contain letters, numbers, and dashes.',
    'alpha_num'            => 'The attribute :attribute may only contain letters and numbers.',
    'array'                => 'The attribute :attribute must be an array.',
    'before'               => 'The attribute :attribute must be a date before :date.',
    'before_or_equal'      => 'The attribute :attribute must be a date before or equal to :date.',
    'between'              => [
        'numeric' => 'The attribute :attribute must be between :min and :max.',
        'file'    => 'The attribute :attribute must be between :min and :max kilobytes.',
        'string'  => 'The attribute :attribute must be between :min and :max characters.',
        'array'   => 'The attribute :attribute must have between :min and :max items.',
    ],
    'boolean'              => 'The attribute :attribute must be true or false.',
    'confirmed'            => 'The attribute :attribute confirmation does not match.',
    'date'                 => 'The attribute :attribute is not a valid date.',
    'date_format'          => 'The attribute :attribute does not match the format :format.',
    'different'            => 'The attribute :attribute and :other must be different.',
    'digits'               => 'The attribute :attribute must be :digits digits.',
    'digits_between'       => 'The attribute :attribute must be between :min and :max digits.',
    'dimensions'           => 'The attribute :attribute has invalid image dimensions.',
    'distinct'             => 'The attribute :attribute has a duplicate value.',
    'email'                => 'The attribute :attribute must be a valid email address.',
    'exists'               => 'The attribute :attribute is invalid.',
    'file'                 => 'The attribute :attribute must be a file.',
    'filled'               => 'The attribute :attribute is required.',
    'image'                => 'The attribute :attribute must be an image.',
    'in'                   => 'The attribute :attribute is invalid.',
    'in_array'             => 'The attribute :attribute does not exist in :other.',
    'integer'              => 'The attribute :attribute must be an integer.',
    'ip'                   => 'The attribute :attribute must be a valid IP address.',
    'json'                 => 'The attribute :attribute must be a valid JSON string.',
    'max'                  => [
        'numeric' => 'The attribute :attribute may not be greater than :max.',
        'file'    => 'The attribute :attribute may not be greater than :max kilobytes.',
        'string'  => 'The attribute :attribute may not be greater than :max characters.',
        'array'   => 'The attribute :attribute may not have more than :max items.',
    ],
    'mimes'                => 'The attribute :attribute must be a file of type: :values.',
    'mimetypes'            => 'The attribute :attribute must be a file of type: :values.',
    'min'                  => [
        'numeric' => 'The attribute :attribute must be at least :min.',
        'file'    => 'The attribute :attribute must be at least :min kilobytes.',
        'string'  => 'The attribute :attribute must be at least :min characters.',
        'array'   => 'The attribute :attribute must have at least :min items.',
    ],
    'not_in'               => 'The selected :attribute is invalid.',
    'numeric'              => 'The attribute :attribute must be a number.',
    'present'              => 'The attribute :attribute must be present.',
    'regex'                => 'The attribute :attribute\'s format is invalid.',
    'required'             => 'The attribute :attribute is required.',
    'required_if'          => 'The attribute :attribute is required when :other is :value.',
    'required_unless'      => 'The attribute :attribute is required unless :other is in :values.',
    'required_with'        => 'The attribute :attribute is required when :values is present.',
    'required_with_all'    => 'The attribute :attribute is required when :values is present.',
    'required_without'     => 'The attribute :attribute is required when :values is not present.',
    'required_without_all' => 'The attribute :attribute is required when none of :values are present.',
    'same'                 => 'The attributes :attribute and :other must match.',
    'size'                 => [
        'numeric' => 'The attribute :attribute must be :size.',
        'file'    => 'The attribute :attribute must be :size kilobytes.',
        'string'  => 'The attribute :attribute must be :size characters.',
        'array'   => 'The attribute :attribute must contain :size items.',
    ],
    'string'               => 'The attribute :attribute must be a string.',
    'timezone'             => 'The attribute :attribute must be a valid time zone.',
    'unique'               => 'The attribute :attribute has already been taken.',
    'uploaded'             => 'The attribute :attribute failed to upload.',
    'url'                  => 'The attribute :attribute format is invalid.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap attribute place-holders
    | with something more reader friendly such as E-Mail Address instead
    | of "email". This simply helps us make messages a little cleaner.
    |
    */

    'attributes' => [],

];
