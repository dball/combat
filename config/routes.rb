Combat::Application.routes.draw do |map|
  root :to => 'maps#latest'

  resources :maps do
    member do
      get :latest
      post :reset, :zoom, :pan
    end
    resources :figures do
      member do
        post :enlarge, :reduce
      end
    end
    resources :walls
    resources :effects
    resources :images
  end
end
