class EffectsController < ApplicationController
  def create
    map = Map.find(params[:map_id])
    if effect = map.effects.create(params[:effect])
      render :json => { :id => effect.id }, :status => :created
    else
      head :error
    end
  end

  def update
    head(effect.update_attributes(params[:effect]) ? :no_content : :error)
  end

  def destroy
    head(effect.destroy ? :no_content : :error)
  end

  private

  def effect
    @effect ||= Effect.find(params[:id], :conditions => { :map_id => params[:map_id] })
  end
end
