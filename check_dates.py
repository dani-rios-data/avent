import pandas as pd

def check_last_seen_dates():
    # Verificar archivo DME
    print("=== Verificando archivo DME ===")
    df_dme = pd.read_csv(r"c:\Users\dany2\Downloads\avent\avent\public\Pathmatics_DME_plus_focus.csv")
    
    # Convertir Last Seen a datetime para comparación
    df_dme['Last Seen'] = pd.to_datetime(df_dme['Last Seen'])
    
    # Filtrar registros con Last Seen anterior a 2024
    mask_dme = df_dme['Last Seen'] < '2024-01-01'
    print(f"Registros con Last Seen < 2024: {mask_dme.sum()}")
    
    if mask_dme.sum() > 0:
        print("Ejemplos:")
        print(df_dme[mask_dme][['First Seen', 'Last Seen']].head())
    
    print("\n=== Verificando archivo Brand Manufacturer ===")
    df_brand = pd.read_csv(r"c:\Users\dany2\Downloads\avent\avent\public\Pathmathics_Brand_Manufacturer_plus_focus.csv")
    
    # Convertir Last Seen a datetime para comparación
    df_brand['Last Seen'] = pd.to_datetime(df_brand['Last Seen'])
    
    # Filtrar registros con Last Seen anterior a 2024
    mask_brand = df_brand['Last Seen'] < '2024-01-01'
    print(f"Registros con Last Seen < 2024: {mask_brand.sum()}")
    
    if mask_brand.sum() > 0:
        print("Ejemplos:")
        print(df_brand[mask_brand][['First Seen', 'Last Seen']].head())

if __name__ == "__main__":
    check_last_seen_dates()