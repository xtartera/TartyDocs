# Capítol 1. Introducció a Windows Server i a les xarxes client-servidor

## Objectius d'aprenentatge

En acabar aquest capítol seràs capaç de:

-   Entendre què és un sistema operatiu en xarxa.
-   Diferenciar un sistema client d'un sistema servidor.
-   Comprendre el paper de Windows Server dins d'una empresa.
-   Identificar els principals serveis que ofereix un servidor.
-   Entendre per què avui dia la majoria de servidors són virtuals.

------------------------------------------------------------------------

# 1. Què és un sistema operatiu en xarxa?

Quan utilitzes un ordinador a casa, normalment tota la informació i els
programes es troben al mateix equip. Si aquest ordinador deixa de
funcionar, ningú més hi pot accedir.

En canvi, una empresa necessita que molts usuaris comparteixin
informació, impressores, aplicacions i recursos de manera segura. Per
aconseguir-ho s'utilitza un **sistema operatiu en xarxa**, com **Windows
Server**, que centralitza els serveis i facilita l'administració.

!!! tip "Recorda"

    Windows Server no està pensat perquè els usuaris hi treballin directament.
    La seva funció és oferir serveis als ordinadors de la xarxa.

# 2. Arquitectura client-servidor

``` text
                 Empresa

             +----------------+
             | Windows Server |
             +----------------+
              /      |       \
        Active   DNS    Fitxers
              \      |       /
          +---------+ +---------+
          | Client1 | | Client2 |
          +---------+ +---------+
```

# 3. Què és Windows Server?

Windows Server és el sistema operatiu de Microsoft orientat a empreses.

Funcions principals:

-   Active Directory
-   DNS
-   DHCP
-   Compartició de fitxers
-   Impressió
-   Polítiques de seguretat

# 4. Virtualització

La virtualització permet executar diversos servidors sobre un mateix
equip físic.

Avantatges:

-   Reducció de costos.
-   Millor aprofitament del maquinari.
-   Snapshots.
-   Recuperació ràpida.
-   Facilitat per fer pràctiques.

!!! warning "Error habitual"

    No configuris mai el servidor amb IP dinàmica.

# 5. Bones pràctiques

-   IP fixa.
-   Nom descriptiu.
-   Documentar els canvis.
-   Comprovar sempre el DNS.

# 6. Autoavaluació

1.  Quina diferència hi ha entre un client i un servidor?
2.  Què és Windows Server?
3.  Quins serveis ofereix?
4.  Per què és útil la virtualització?
