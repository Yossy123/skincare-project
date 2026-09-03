<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShippingRateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'destination' => ['required'],
            'weight' => ['required', 'integer', 'min:1', 'max:30000'],
            'couriers' => ['nullable'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'destination.required' => 'Destination city or address is required for calculating shipping rates.',
            'weight.required' => 'Package weight is required.',
            'weight.min' => 'Package weight must be at least 1 gram.',
            'weight.max' => 'Package weight exceeds the maximum 30 kg courier limit.',
        ];
    }
}
