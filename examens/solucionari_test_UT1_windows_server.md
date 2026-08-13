# Solucionari · Examen test UT1 — Windows Server 2022

**Ús exclusiu del professorat.** Distribució de respostes correctes: **10 A, 10 B, 10 C, 10 D**.

## Graella de correcció ràpida

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:--:|
| A | C | D | B | A | C | D | B | C | A |

| 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| D | B | C | D | A | B | D | C | B | A |

| 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| D | C | B | A | D | C | B | A | D | B |

| 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| C | A | D | C | B | A | D | C | B | A |

---

## Justificacions

1. **A** — El servidor està dissenyat per donar servei concurrent a molts clients; la resta són falses o irrellevants.
2. **C** — El servidor centralitza i ofereix recursos; qui sol·licita (A) és el client.
3. **D** — Virtualitzar permet aïllar i provar servidors sense maquinari dedicat; no elimina xarxa ni RAM.
4. **B** — Un DC + servidor de fitxers necessita recursos amplis i IP fixa; 512 MB o DHCP són inadequats.
5. **A** — Server Core redueix superfície d'atac i consum; té *menys* GUI, no més.
6. **C** — NTFS és l'estàndard amb permisos i journaling; FAT32/exFAT no ofereixen permisos i ext4 és de Linux.
7. **D** — Barrejar-ho tot dificulta gestió, còpies i recuperació; sí que es poden crear múltiples particions.
8. **B** — IP estàtica i nom d'equip correctes són imprescindibles per a un DC; desactivar el tallafoc o FAT32 són errors.
9. **C** — El Server Manager centralitza rols i característiques.
10. **A** — Un script de PowerShell (import + `New-ADUser`) és la via eficient per a altes massives.
11. **D** — 4625 = inici fallit, 4624 = correcte: intents fallits seguits d'un d'exitós (oblit o força bruta).
12. **B** — El Monitor de rendiment grava dades durant hores; l'Administrador de tasques només mostra l'instant.
13. **C** — `unattend.xml` automatitza la instal·lació desatesa.
14. **D** — AD usa Kerberos, que treballa amb tiquets i no envia la contrasenya.
15. **A** — El bosc és el contenidor de seguretat superior que agrupa arbres de dominis.
16. **B** — Dins d'un bosc les confiances són bidireccionals i transitives automàtiques.
17. **D** — En una confiança unidireccional A→B, els usuaris de B són reconeguts a A, no a l'inrevés.
18. **C** — La confiança només el fa reconegut; cal assignar-li permisos sobre el recurs.
19. **B** — El DNS (registres SRV) és crític per localitzar el DC.
20. **A** — ADUC gestiona usuaris, grups i UO del domini.
21. **D** — Les restriccions horàries limiten les franges d'inici de sessió.
22. **C** — Cal valorar el risc i cercar alternatives; acceptar sense condicions o esborrar polítiques és insegur.
23. **B** — `New-ADUser` crea comptes d'usuari a AD.
24. **A** — El DNS del client ha d'apuntar al DC per localitzar el domini via SRV.
25. **D** — `whoami /all` mostra usuari, domini i grups de la sessió.
26. **C** — `gpresult /r` mostra les GPO aplicades i denegades.
27. **B** — En accés per xarxa preval el permís **més restrictiu** entre compartició i NTFS.
28. **A** — `icacls` gestiona permisos NTFS per línia de comandes.
29. **D** — L'herència propaga els permisos de la carpeta pare als subelements.
30. **B** — El límit real és el més restrictiu: NTFS *Modificar*.
31. **C** — Una GPO és un conjunt de configuracions aplicades de forma centralitzada.
32. **A** — La Default Domain Policy conté per defecte les polítiques de contrasenya.
33. **D** — `gpupdate /force` força l'actualització de polítiques al client.
34. **C** — Denegada per filtratge = l'usuari/equip queda fora de l'abast (UO o seguretat).
35. **B** — El perfil mòbil permet retrobar l'escriptori des de qualsevol equip del domini.
36. **A** — El sufix `.V6` indica la versió del perfil segons la versió del client Windows.
37. **D** — La redirecció desa les carpetes al servidor perquè segueixin l'usuari i es puguin copiar.
38. **C** — Amb només lectura, els usuaris no podran desar (escriure) el seu perfil.
39. **B** — Cal activar prèviament l'auditoria d'accés a objectes; no es registra tot per defecte.
40. **A** — El flux correcte és revisar auditoria/registres i correlacionar amb usuaris i permisos, no reinstal·lar ni esborrar.
