OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, '520928464543-vd94r6734gcn7inu805pesd0f8no645a.apps.googleusercontent.com', 'iV2e_nAHY7duSai7NOQYTuvt', {client_options: {ssl: {ca_file: Rails.root.join("cacert.pem").to_s}}}
end